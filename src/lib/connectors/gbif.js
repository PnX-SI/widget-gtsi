import { Connector } from "./connector";
import { Taxon } from "../models";
import ParameterStore from "../parameterStore";

const NO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg";

const GBIF_ENDPOINT_DEFAULT = "https://api.gbif.org/v1";

function callOccurrenceApi(params = {}) {
  let urlWithParams = new URL(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`);

  for (const [key, value] of Object.entries(params)) {
    urlWithParams.searchParams.append(key, value);
  }
  const url = urlWithParams.toString();
  return fetch(url).then((response) => {
    return response.json();
  });
}

class GbifConnector extends Connector {
  GBIF_ENDPOINT;
  constructor(options) {
    super(options);
    this.name = "GBIF";
    // this.verifyOptions(["API_ENDPOINT"])
    this.GBIF_ENDPOINT = this.options["GBIF_ENDPOINT"] || GBIF_ENDPOINT_DEFAULT;
  }
  countOccurrence(params = {}) {
    return callOccurrenceApi({ params }).then((data) => {
      return data.count;
    });
  }

  fetchVernacularName(taxonID) {
    const mapping_language = { en: "eng", fr: "fra" };
    const currentLanguage = ParameterStore.getInstance().lang.value;
    return fetch(
      `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
    )
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let name = undefined;
        data.results.forEach((nameData) => {
          if (nameData.language == mapping_language[currentLanguage]) {
            name = nameData.vernacularName.capitalize();
            return;
          }
        });
        return name;
      });
  }

  fetchOccurrence(params) {
    if (!params.limit) {
      params.limit = 300;
    }
    if (!params.maxPage) {
      params.maxPage = 10;
    }
    if (params.dateMin && params.dateMax) {
      params = { ...params, eventDate: `${params.dateMin},${params.dateMax}` };
    }

    return this.countOccurrence(params).then(async function (countOccurrence) {
      // Compute the number of pages we need to query
      let nbOfPages = Math.ceil(countOccurrence / params.limit);
      if (nbOfPages > params.maxPage) {
        nbOfPages = params.maxPage;
      }

      // Create a promise for each page
      let promises = [];
      for (let pageIndex = 0; pageIndex < nbOfPages; pageIndex++) {
        const offset = pageIndex * params.limit;
        promises.push(callOccurrenceApi({ ...params, offset }));
      }
      let taxonsData = {};
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
              if (!taxonsData.hasOwnProperty(observation.taxonKey)) {
                taxonsData[observation.taxonKey] = new Taxon({
                  acceptedScientificName: observation.acceptedScientificName,
                  vernacularName: observation.vernacularName,
                  taxonId: observation.taxonKey,
                  mediaUrl: NO_IMAGE_URL,
                  taxonRank: observation.taxonRank,
                  kingdom: observation.kingdom,
                  class: observation.class,
                  nbObservations: 0,
                  description: "",
                  lastSeenDate: new Date(observation.eventDate).getTime(),
                });
              }
              taxonsData[observation.taxonKey].nbObservations += 1;
              taxonsData[observation.taxonKey].lastSeenDate = new Date(
                Math.max(
                  new Date(observation.eventDate).getTime(),
                  new Date(
                    taxonsData[observation.taxonKey].lastSeenDate
                  ).getTime()
                )
              );
            });
          });
      });
      return taxonsData;
    });
  }

  fetchMedia(idTaxon) {
    const url = `https://api.gbif.org/v1/species/${idTaxon}/media`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        let mediaList = this.processMedia(json.results);
        if (mediaList.length == 0) {
          return this.fetchMediaOccurence(idTaxon);
        }
        else {
          return mediaList;
        }
      });
  }

  processMedia(medias) {
    let mediaList = [];
    Object.values(medias).forEach((media) => {
      if (
        media.hasOwnProperty("license") &&
        media.hasOwnProperty("rightsHolder")
      ) {
        mediaList.push({
          url: media.identifier,
          licence: media.licence,
          source: `${media.rightsHolder} (${media.license})`,
        })
      }
    });
    return mediaList;
  }

  fetchMediaOccurence(idTaxon) {
    const url = `https://api.gbif.org/v1/occurrence/search?limit=10&mediaType=StillImage&speciesKey=${idTaxon}`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        let medias = [];
        json.results.forEach((element) => {
          medias = medias.concat(element.media);
        });
        return this.processMedia(medias);
      });
  }

  fetchTaxonInfo(idTaxon) {
    const url = `https://api.gbif.org/v1/species/${idTaxon}?language=${this.language}`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        return {
          scientificName: json.scientificName,
          vernacularName: json.vernacularName,
          rank: json.rank,
          taxonKey: json.key,
        };
      });
  }
  fetchTaxonStatus(idTaxon) {
    const url = `https://api.gbif.org/v1/species/${idTaxon}/iucnRedListCategory`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        return {
          iucnRedListCategory: json.category,
          code: json.code,
        };
      });
  }

  searchTaxon(searchString = "", params = {}) {
    const url = `https://api.gbif.org/v1/species/search?q=${searchString}&limit=20`;
    console.log(url);
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        let results = [];
        json.results.forEach((element) => {
          results.push({
            scientificName: element.scientificName,
            // vernacularName: element?.vernacularName[0].vernacularName,
            taxonKey: element.key,
          });
        });
        return results;
      });
  }
  getTaxonDetailPage(taxonId) {
    return `https://www.gbif.org/species/${taxonId}`;
  }
}
export { GbifConnector };
