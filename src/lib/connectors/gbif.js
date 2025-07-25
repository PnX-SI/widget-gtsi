import { Connector } from "./connector";
import { Media, Taxon } from "../models";
import ParameterStore from "../parameterStore";
import { NO_IMAGE_URL } from "@/assets/constant";
import { TAXON_REFERENTIAL } from "../taxonReferential";
import { getMediaSource, SOURCE_ } from "../media/media";
import { useI18n } from "vue-i18n";
import { CONNECTORS } from "./connectors";

const GBIF_ENDPOINT_DEFAULT = "https://api.gbif.org/v1";
const GBIF_DEFAULT_LIMIT = 300;
const GBIF_DEFAULT_NB_PAGES = 10;
/**
 * Calls the GBIF occurrence API with the given parameters.
 * @param {Object} params - The parameters to pass to the API.
 * @returns {Promise<Object>} A promise that resolves to the JSON response from the API.
 */
function callOccurrenceApi(params = {}) {
  const urlWithParams = new URL(`${GBIF_ENDPOINT_DEFAULT}/occurrence/search`);
  Object.entries(params).forEach(([key, value]) => {
    urlWithParams.searchParams.append(key, value);
  });
  return fetch(urlWithParams.toString()).then((response) => response.json());
}

/**
 * A connector class for interacting with the GBIF API.
 */
class GbifConnector extends Connector {
  /**
   * Creates an instance of GbifConnector.
   * @param {Object} options - The options for the connector.
   */
  constructor(options) {
    super(options);
    this.name = CONNECTORS.GBIF;

    // specific parameters
    this.GBIF_ENDPOINT = this.options?.GBIF_ENDPOINT || GBIF_ENDPOINT_DEFAULT;
    this.LIMIT = this.options?.LIMIT || GBIF_DEFAULT_LIMIT;
    this.NB_PAGES = this.options?.NB_PAGES || GBIF_DEFAULT_NB_PAGES;

    this.referential = TAXON_REFERENTIAL.GBIF;

    this.imageSource = this.imageSource || getMediaSource(SOURCE_.WIKIDATA);
    this.soundSource = this.soundSource || getMediaSource(SOURCE_.GBIF);

    this.taxonClass2SourceID = {
      Aves: 212,
      Mammalia: 359,
      Reptilia: 358,
      Amphibia: 131,
      Insecta: 216,
      Arachnida: 367,
      Gastropoda: 225,
      Bivalvia: 137,
      Magnoliopsida: 220,
      Liliopsida: 196,
      Pinopsida: 194,
    };
  }

  getParamsSchema() {
    const { t } = useI18n();
    return [
      {
        name: "GBIF_ENDPOINT",
        label: "Adresse de l'API du GBIF",
        type: String,
        default: "https://api.gbif.org/v1",
      },
      {
        name: "LIMIT",
        label: t("limit"),
        type: Number,
        default: GBIF_DEFAULT_LIMIT,
      },
      {
        name: "NB_PAGES",
        label: t("nbPages"),
        type: Number,
        default: GBIF_DEFAULT_NB_PAGES,
      },
    ];
  }

  /**
   * Counts the occurrences based on the given parameters.
   * @param {Object} params - The parameters for the occurrence query.
   * @returns {Promise<number>} A promise that resolves to the count of occurrences.
   */
  countOccurrence(params = {}) {
    return callOccurrenceApi(params).then((data) => data.count);
  }

  fetchVernacularName(taxonID) {
    const mapping_language = { en: "eng", fr: "fra" };
    const currentLanguage = ParameterStore.getInstance().lang.value;
    return fetch(
      `${this.GBIF_ENDPOINT}/species/${taxonID}/vernacularNames?limit=100`
    )
      .then((response) => response.json())
      .then((data) => {
        const nameData = data.results.find(
          (nameData) => nameData.language === mapping_language[currentLanguage]
        );
        return nameData ? nameData.vernacularName.capitalize() : undefined;
      });
  }

  fetchOccurrence(params) {
    let defaultParams = {
      limit: this.LIMIT,
      maxPage: this.NB_PAGES,
      ...params,
    };
    if (defaultParams.dateMin && defaultParams.dateMax) {
      defaultParams.eventDate = `${defaultParams.dateMin},${defaultParams.dateMax}`;
    }

    if (params?.class) {
      defaultParams = {
        ...defaultParams,
        classKey: this.taxonClass2SourceID[params?.class],
      };
    }

    return this.countOccurrence(defaultParams).then((countOccurrence) => {
      const nbOfPages = Math.min(
        Math.ceil(countOccurrence / defaultParams.limit),
        defaultParams.maxPage
      );
      const taxonsData = {};

      // Function to fetch page data
      // Use recursion to chain data fetching
      const fetchPage = (pageIndex) => {
        // Stop recursion when all pages are fetched
        if (pageIndex >= nbOfPages) {
          return Promise.resolve();
        }

        const offset = pageIndex * defaultParams.limit;
        return callOccurrenceApi({ ...defaultParams, offset }).then(
          (apiResult) => {
            apiResult.results.forEach((observation) => {
              if (!taxonsData[observation.taxonKey]) {
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

            // Fetch the next page
            return fetchPage(pageIndex + 1);
          }
        );
      };

      // Start fetching from the first page
      return fetchPage(0).then(() => taxonsData);
    });
  }

  fetchTaxonInfo(idTaxon) {
    const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => ({
        scientificName: json.scientificName,
        vernacularName: json.vernacularName,
        rank: json.rank,
        taxonKey: json.key,
      }));
  }

  fetchTaxonStatus(idTaxon) {
    const url = `${this.GBIF_ENDPOINT}/species/${idTaxon}/iucnRedListCategory`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) => ({
        iucnRedListCategory: json.category,
        code: json.code,
      }));
  }

  searchTaxon(searchString = "", params = {}) {
    const url = `${this.GBIF_ENDPOINT}/species/search?q=${searchString}&limit=20`;
    return fetch(url)
      .then((response) => response.json())
      .then((json) =>
        json.results.map((element) => ({
          scientificName: element.scientificName,
          taxonKey: element.key,
        }))
      );
  }

  getTaxonDetailPage(taxonId) {
    return `https://www.gbif.org/species/${taxonId}`;
  }

  sourceDetailMessage() {
    return useI18n().t("source.gbifWarning");
  }
}

export { GbifConnector };
