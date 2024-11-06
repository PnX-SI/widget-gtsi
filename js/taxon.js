function getGbifTaxon(wkt, speciesList, page) {
  console.log("getGbifTaxon", page);
  const limit = 300;
  const offset = page * limit;
  geometry = wkt;
  fetch(
    "https://api.gbif.org/v1/occurrence/search?geometry=${geometry}&limit=${limit}&offset=${offset}"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      data.results.forEach((element) => {
        occCount = (speciesList[element.species] || {})["occCount"] || 0;
        speciesList[element.species] = {
          gbifId: element.taxonKey,
          occCount: occCount + 1,
        };
      });

      console.log(speciesList);
      if (data.endOfRecords == false) {
        getGbifTaxon(wkt, speciesList, page + 1);
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}