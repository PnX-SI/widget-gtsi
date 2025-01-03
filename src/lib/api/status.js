/**
 * Given a taxonData object, fetch its status data from TaxRef API
 * @param {Object} taxonData - a taxon data object with a cd_ref property
 * @returns {Promise<Object[]>} - a list of status objects
 */
function getStatusForATaxon(taxonData) {
  return fetch(
    `https://taxref.mnhn.fr/api/taxa/${taxonData.cdRef}/status/columns`
  )
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      return json._embedded?.status;
    });
}

export { getStatusForATaxon };
