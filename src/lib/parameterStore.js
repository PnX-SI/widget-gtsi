import { ref } from "vue";
import { getConnector } from "./connectors/utils";
import { useRoute } from "vue-router";
import { parse, stringify } from "wellknown";
import { buffer } from "@turf/turf";
import { useI18n } from "vue-i18n";

class ParameterStore {
  static instance = null;
  constructor() {
    if (ParameterStore.instance) return;
    ParameterStore.instance = this;
    //must be called here
    const { locale, availableLocales } = useI18n();

    this.radius = ref(1);
    this.wkt = ref("");
    this.dateMin = ref(null);
    this.dateMax = ref(null);
    this.connector = ref(getConnector(null, {}));
    this.itemsPerPage = ref(10);
    this.nbTaxonPerLine = ref(null);
    this.showFilters = ref(true);
    this.lang = locale;

    const params_from_url = useRoute()?.query;
    if (!params_from_url) return;
    if ("radius" in params_from_url) {
      this.radius.value = parseInt(params_from_url.radius);
    }
    if ("wkt" in params_from_url) {
      this.wkt.value = validateWKT(params_from_url.wkt, this.radius.value);
    }
    if ("sourceGeometry" in params_from_url) {
      fetch(params_from_url.sourceGeometry)
        .then((res) => res.json())
        .then((geojson) => {
          this.wkt.value = validateWKT(stringify(geojson), this.radius.value);
        })
        .catch((err) => console.error(err));
    }
    if ("dateMin" in params_from_url) {
      this.dateMin.value = params_from_url.dateMin;
    }
    if ("dateMax" in params_from_url) {
      this.dateMax.value = params_from_url.dateMax;
    }
    if ("connector" in params_from_url) {
      this.connector.value = getConnector(params_from_url.connector, {
        ...params_from_url,
      });
    }
    if ("itemsPerPage" in params_from_url) {
      this.itemsPerPage.value = parseInt(params_from_url.itemsPerPage);
    }
    if ("nbTaxonPerLine" in params_from_url) {
      this.nbTaxonPerLine.value = parseInt(params_from_url.nbTaxonPerLine);
    }
    if ("showFilters" in params_from_url) {
      this.showFilters.value =
        params_from_url["showFilters"] == "true" ? true : false;
    }
    if ("lang" in params_from_url) {
      if (availableLocales.includes(params_from_url["lang"])) {
        locale.value = params_from_url["lang"];
      }
    }
    ParameterStore.instance = this;
  }
  getParams() {
    const params = {};
    Object.entries(this)
      .filter(([key, value]) => value !== undefined && value !== null)
      .forEach(([key, value]) => (params[key] = value.value));
    return params;
  }
  static instance;
  static getInstance() {
    if (!ParameterStore.instance) {
      new ParameterStore();
    }
    return ParameterStore.instance;
  }
}

const validateWKT = (wkt, radius) => {
  if (wkt && (wkt.includes("POINT") || wkt.includes("LINESTRING"))) {
    const buffered = buffer(parse(wkt), radius);
    return stringify(buffered);
  }
  return wkt;
};

export default ParameterStore;
