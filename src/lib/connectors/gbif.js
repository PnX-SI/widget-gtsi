import { Connector } from "./connector";

const NO_IMAGE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg";

const GBIF_ENDPOINT = "https://api.gbif.org/v1";

class GbifConnector extends Connector {

  fetchOccurrence(params) {
    let urlWithParams = new URL(`${GBIF_ENDPOINT}/occurrence/search`);

    for (const [key, value] of Object.entries(params)) {
      urlWithParams.searchParams.append(key, value);
    } 
    const url = urlWithParams.toString();
    return fetch(url).then((response) => {
      return response.json();
    });
  }

  fetchMedia(idTaxon) {
    const url = `https://api.gbif.org/v1/species/${idTaxon}/media`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        let mediaList = [];
        Object.values(json.results).forEach((media) => {
          if (media.audience !== "biologists") {
            mediaList.push({
              url: media.identifier,
              licence: media.licence,
              source: media.source
            })
          }
        });
        return mediaList
      });
  }
  fetchTaxonInfo(idTaxon) {
    const url = `https://api.gbif.org/v1/species/${idTaxon}`;
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
}
export { GbifConnector };
