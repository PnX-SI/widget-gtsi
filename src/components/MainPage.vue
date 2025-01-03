<script setup>
import "leaflet/dist/leaflet.css";
import Map from "./Map.vue";
import { onMounted, ref, watch } from "vue";
import ListeTaxon from "./ListeTaxon.vue";
import Filters from "./Filters.vue";
import { GbifConnector } from "@/lib/connectors/gbif";

const radius = ref(1);
const wktSelected = ref("");
const dateMin = ref(null);
const dateMax = ref(null);

const params = new URLSearchParams(window.location.search);
if (params.has("radius")) {
  radius.value = parseInt(params.get("radius"));
}
if (params.has("wkt")) {
  wktSelected.value = params.get("wkt");
}
if (params.has("dateMin")) {
  dateMin.value = params.get("dateMin");
}
if (params.has("dateMax")) {
  dateMax.value = params.get("dateMax");
}
</script>

<template>
  <div class="container-fluid">
    <h1 id="title" class="col-12 text-center m-3">🐦Taxons around me🐛</h1>

    <div class="row">
      <div class="col m-2 mt-1 mb-3">
        <Filters
          :radius="radius"
          @dateMin="(newDateMin) => (dateMin = newDateMin)"
          @dateMax="(newDateMax) => (dateMax = newDateMax)"
          @radius="(newradius) => (radius = parseInt(newradius))"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-lg-6 col-md-6">
        <Map
          :radius="radius"
          :wkt="wktSelected"
          @wkt="(drawGeometryWKT) => (wktSelected = drawGeometryWKT)"
        />
      </div>
      <div class="col-12 col-lg-6 col-md-6">
        <ListeTaxon
          :wkt="wktSelected"
          :dateMin="dateMin"
          :dateMax="dateMax"
          :itemPerPage="10"
        />
      </div>
    </div>
  </div>
</template>

<script type="module"></script>

<style scoped>
#map {
  height: 70vh;
}
#liste-taxons {
  padding: 1em;
}
</style>
