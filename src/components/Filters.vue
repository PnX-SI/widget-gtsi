<script setup>
import { ref, watch, watchEffect } from "vue";

const radius = ref(10);
const dateMin = ref(null);
const dateMax = ref(null);
const occMaxRetrieved = ref(300);
const maxPage = ref(10);

const props = defineProps({
  radius: Number,
  dateMin: Date,
  dateMax: Date,
});

watchEffect(() => {
  radius.value = props.radius;
  dateMin.value = props.dateMin;
  dateMax.value = props.dateMax;
});

const emit = defineEmits(["radius", "dateMin", "dateMax"]);

watch([radius, dateMin, dateMax], () => {
  emit("radius", radius.value);
  emit("dateMin", dateMin.value);
  emit("dateMax", dateMax.value);
});
</script>
<template>
  <div class="row g-3 mb-3" id="filters">
    <div class="col-12 col-md-12 col-lg-1" id="filtersTitle">
      <h3><i class="bi bi-filter"></i> Filtres</h3>
    </div>
    <div class="col-12 col-md-4 col-lg-3">
      <label for="radius" class="form-label"
        >Buffer Size: {{ radius }} km</label
      >
      <input
        type="range"
        class="form-range"
        min="0"
        max="100"
        v-model="radius"
        id="radius"
      />
    </div>
    <div class="col-12 col-md-4 col-lg-3">
      <label for="startDate">Date Min</label>
      <input
        id="startDate"
        class="form-control"
        type="date"
        v-model="dateMin"
      />
    </div>
    <div class="col-12 col-md-4 col-lg-3">
      <label for="endDate">Date Max</label>
      <input id="endDate" class="form-control" type="date" v-model="dateMax" />
    </div>
  </div>
</template>
<style>
#filters {
  background-color: white;
}
label {
  font-weight: bold;
}
#filtersTitle {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
