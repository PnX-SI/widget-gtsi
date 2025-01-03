/**
 * Fetch the url of the first image for a given GBIF id.
 * @param {number} gbifId - GBIF id of the taxon
 * @returns {Promise<string>} - a promise resolving to the url of the first
 *   image for the given taxon, or undefined if no image is found
 */
function getMedias(gbifId) {
  const url = "https://api.gbif.org/v1/species/" + gbifId + "/media";

  return fetch(url, { method: "GET" })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      // Media checking
      if (json.results.length > 0) {
        return json.results[0].identifier;
      }
    });
}

export { getMedias };
