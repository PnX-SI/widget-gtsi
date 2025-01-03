<script setup>
import { onMounted, ref, computed, watchEffect, onUpdated } from "vue";
import { GbifConnector } from "../lib/connectors/gbif.js";
import { lineChunk } from "@turf/turf";

const props = defineProps({
  taxonId: Number,
  name: String, 
  description: String,
  observationDate: String,
  count: Number,
});


const speciesMedia = ref([]);


const speciesMediaShowed = computed(() => {
  if (speciesMedia.value.length == 0) {
    return { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg" }
  }
  return speciesMedia.value[0];
});

function refreshTaxonImage() {
  speciesMedia.value = [];
  if (props.taxonId) {
    new GbifConnector().fetchMedia(props.taxonId).then((response) => {
      speciesMedia.value = response
    })
  }
}

watchEffect(() => {
  // Quand props change
  refreshTaxonImage()
});

</script>

<template>
  <div class="card mb-3">
    <div class="row">
      <div class="col-md-4 p-0">
        <img :src="speciesMediaShowed?.url" class="card-img-top" :alt="speciesMediaShowed?.url" />
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title"> {{ props.name }}</h5>
          <!-- <p class="description card-text">{{ props.description }}</p> -->
          <p class="card-text">
            <small class="text-body-secondary"
              >Observé le : {{ props.observationDate }}</small
            >
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="col-12 col-sm-12 col-md-6 col-lg-3">
    <div class="card">
      <img :src="props.imageUrl" class="card-img-top" :alt="props.imageUrl" />
      <div class="card-body">
        <h5 class="card-title">{{ props.name }}</h5>
        <p class="description card-text">{{ props.description }}</p>
        <p class="card-text">Nombre d'observations : {{ props.count }}</p>
      </div>
      <div class="card-footer">
        <small class="text-body-secondary"
          >Observé le : {{ props.observationDate }}</small
        >
      </div>
    </div>
  </div> -->
</template>

<style>
img {
  border-radius: none !important;
  height: 200px;
  width: 200px;
  object-fit: cover;
}
.description {
  height: 10vh;
}
</style>
