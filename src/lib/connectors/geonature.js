import { Connector } from "./connector";
import { Taxon } from "../models";
import { NO_IMAGE_URL } from "@/assets/constant";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { getMediaSource, SOURCE_ } from "../media/media";
import { useI18n } from "vue-i18n";
import { CONNECTORS } from "./connectors";

const GEONATURE_DEFAULT_LIMIT = "ALL";

class GeoNatureConnector extends Connector {
  API_ENDPOINT;

  constructor(options) {
    super(options);
    this.name = CONNECTORS.GeoNature;
    // this.verifyOptions(["EXPORT_API_ENDPOINT"]);
    this.API_ENDPOINT = options?.API_ENDPOINT;
    this.ID_EXPORT = options?.ID_EXPORT || 35;
    this.LIMIT = this.options?.LIMIT || GEONATURE_DEFAULT_LIMIT;
    this.referential = TAXON_REFERENTIAL.TAXREF;

    this.imageSource = this.imageSource ?? getMediaSource(SOURCE_.TAXREF_ODATA);
    this.soundSource = this.soundSource ?? getMediaSource(SOURCE_.TAXREF_ODATA);
  }

  getParamsSchema() {
    const { t } = useI18n();
    return [
      {
        name: "API_ENDPOINT",
        label: t("geonature.api_endpoint"),
        type: String,
        default: "https://demo.geonature.fr/geonature/api",
      },
      {
        name: "ID_EXPORT",
        label: t("geonature.id_export"),
        type: Number,
        default: 35,
      },
      {
        name: "LIMIT",
        label: t("limit"),
        type: Number,
        default: GEONATURE_DEFAULT_LIMIT,
      },
    ];
  }

  fetchOccurrence(params = {}) {
    let urlWithParams = new URL(
      `${this.API_ENDPOINT}/exports/api/${this.ID_EXPORT}`
    );
    params = { ...params, limit: this.LIMIT };
    for (const [key, value] of Object.entries(params)) {
      urlWithParams.searchParams.append(key, value);
    }
    const url = urlWithParams.toString();
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        let taxonsData = {};
        json.items.features.forEach((item) => {
          item = item.properties;

          if (!taxonsData.hasOwnProperty(item.cd_ref)) {
            taxonsData[item.cd_ref] = new Taxon({
              acceptedScientificName: item.nom_scientifique,
              vernacularName: item.nom_vernaculaire,
              taxonId: item.cd_ref,
              taxonKey: item.cd_ref,
              mediaUrl: NO_IMAGE_URL,
              taxonRank: "", //this.fetchTaxonInfo(item.cd_ref),
              nbObservations: 0,
              description: "",
              lastSeenDate: new Date(item.date_max).getTime(),
            });
          }
          taxonsData[item.cd_ref].nbObservations += 1;
          taxonsData[item.cd_ref].lastSeenDate = new Date(
            Math.max(
              new Date(item.date_max).getTime(),
              new Date(taxonsData[item.cd_ref].lastSeenDate).getTime()
            )
          );
        });
        return taxonsData;
      });
  }

  fetchTaxonInfo(idTaxon) {
    const url = `https://odata-inpn.mnhn.fr/taxa/${idTaxon}`; //
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then(function (json) {
        return {
          scientificName: json.names.scientific,
          vernacularName: json.names.vernacular.fr[0],
          rank: json.rank,
          taxonKey: json.taxrefId,
        };
      });
  }
  fetchTaxonStatus(idTaxon) {
    const url = `https://taxref.mnhn.fr/api/taxa/${idTaxon}/status/columns`;
    return fetch(url)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json._embedded?.status;
      });
  }

  getTaxonDetailPage(taxonId) {
    return `https://inpn.mnhn.fr/espece/cd_nom/${taxonId}`;
  }

  fetchVernacularName(taxonId) {
    return Promise.resolve(null);
  }
}
export { GeoNatureConnector };
