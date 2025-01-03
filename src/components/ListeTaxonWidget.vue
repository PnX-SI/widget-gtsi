<script setup>
import { onMounted, ref } from "vue";
import ListeTaxon from "./ListeTaxon.vue";

const radius = ref(1);
const wktSelected = ref(
  "POLYGON ((-0.293568 51.481301, -0.334792 51.406792, -0.028364 51.403363, -0.048976 51.497557, -0.219366 51.537745, -0.293568 51.481301))"
);
const dateMin = ref(null);
const dateMax = ref(null);

onMounted(() => {
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
});
</script>

<template>
  <div class="container">
    <ListeTaxon
      :wkt="wktSelected"
      :dateMin="dateMin"
      :dateMax="dateMax"
      :itemPerPage="10"
    />
  </div>
</template>
