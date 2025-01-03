const DEFAULT_NB_MAX_TAXONS = 10;

/**
 * Fetch a page of taxon data from GBIF given a WKT string
 * @param {string} wkt - Well-Known Text representation of a polygon
 * @param {Object} paramsGBIF - parameters to pass to the API
 * @param {number} limit - number of results to return
 * @param {number} offset - offset of the first result
 * @returns {Promise<import('gbif-types').GBIFSearchResponse>}
 */
function occurrenceTaxonGBIF(
  wkt,
  paramsGBIF = {},
  limit = null,
  offset = null
) {
  let url = `https://api.gbif.org/v1/occurrence/search?geometry=${wkt}`;
  url += limit ? `&limit=${limit}` : "";
  url += offset ? `&offset=${offset}` : "";
  for (const [key, value] of Object.entries(paramsGBIF)) {
    url += `&${key}=${value}`;
  }
  return fetch(url).then((response) => {
    return response.json();
  });
}

function countOccurrence(wkt) {
  return occurrenceTaxonGBIF(wkt, {}, 1).then((data) => {
    return data.count;
  });
}
/**
 * Fetch the list of taxons from GBIF given a WKT string
 * @param {string} wkt - Well-Known Text representation of a polygon
 * @param {number} [nbMaxTaxons=DEFAULT_NB_MAX_TAXONS] - maximum number of results to return
 * @param {Object} [params={ limit: 300 }] - parameters to pass to the API
 * @returns {Promise<Array<{gbifId: number, occCount: number, species: string}>>} - a list of taxons with their occurrence count and GBIF id
 */
function getGbifTaxon(
  wkt,
  paramsGBIF = {},
  params = { limit: 300, maxPage: 10 }
) {
  return countOccurrence(wkt).then(async function (countOccurrence) {
    // Compute the number of pages we need to query
    let nbOfPages = Math.ceil(countOccurrence / params.limit);
    if (nbOfPages > params.maxPage) {
      nbOfPages = params.maxPage;
    }

    // Create a promise for each page
    let promises = [];
    for (let pageIndex = 0; pageIndex < nbOfPages; pageIndex++) {
      const offset = pageIndex * params.limit;
      promises.push(occurrenceTaxonGBIF(wkt, paramsGBIF, params.limit, offset));
    }
    let speciesList = {};
    // Run all promises and await for the responses
    await Promise.all(promises).then((listOfData) => {
      listOfData
        .map((apiResult) => {
          return apiResult.results;
        })
        // For each page
        .forEach((resultsPage) => {
          // For each occurrence retrieve the gbifID and increase occurrence count
          resultsPage.forEach((observation) => {
            let occCount =
              (speciesList[observation.species] || {})["occCount"] || 0;
            speciesList[observation.species] = {
              lat: observation.decimalLatitude,
              lng: observation.decimalLongitude,
              acceptedScientificName: observation.acceptedScientificName,
              eventDate: observation.eventDate,
              gbifID: observation.gbifID,
              taxonKey: observation.taxonKey,
              taxonId: observation.taxonKey,
              occCount: occCount + 1,
            };
          });
        });
    });
    return speciesList;
  });
}

export { occurrenceTaxonGBIF as fetchApiTaxonGbif, getGbifTaxon };
