<script setup>
import TaxonList from "@/components/core/TaxonList.vue";
import ParameterStore from "@/lib/parameterStore";
const config = ParameterStore.getInstance();
</script>

<template>
  <div>
    <div v-if="config.wkt.value.length > 0">
      <TaxonList :nbTaxonPerLine="4" style="height: 100vh" />
    </div>
    <div v-else>
      <h2 class="col-12 text-center m-3">Aucune géométrie fournie !</h2>
    </div>
  </div>
</template>
