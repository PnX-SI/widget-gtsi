<script setup>
import { ref, computed, watchEffect } from "vue";
const props = defineProps({
  taxonId: Number,
  scientificName: String,
  vernacularName: String,
  rank: String,
  description: String,
  observationDate: Date,
  count: Number,
  connector: { type: Object, required: true },
});

const speciesMedia = ref([]);

const speciesMediaShowed = computed(() => {
  if (speciesMedia.value.length == 0) {
    return {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/No_Image_Available.jpg/1024px-No_Image_Available.jpg",
    };
  }
  return speciesMedia.value[0];
});

function refreshTaxonImage() {
  speciesMedia.value = [];
  if (props.taxonId) {
    props.connector.fetchMedia(props.taxonId).then((response) => {
      speciesMedia.value = response;
    });
  }
}

watchEffect(() => {
  // if any of props changes
  refreshTaxonImage();
});
</script>

<template>
  <div class="col">
    <div class="card h-100">
      <img
        class="card-img-top"
        :src="speciesMediaShowed?.url"
        :alt="speciesMediaShowed?.url"
        :title="'Source: ' + speciesMediaShowed?.source"
      />
      <div class="card-body">
        <div class="card-text">
          <h5 class="card-title text-wrap">
            {{ props.vernacularName || props.scientificName }}
          </h5>
          <small class="text-body-secondary"
            ><strong>{{ $t("taxon.scientificName") }} :</strong>
            {{ props.scientificName }}</small
          ><br />

          <small class="text-body-secondary">
            <strong>{{ $t("taxon.nbObservations") }} : </strong
            >{{ props.count }}
          </small>
          <br />
        </div>
      </div>
      <div class="card-footer">
        <small class="text-body-secondary"
          >{{ $t("taxon.lastSeenDate") }} :
          {{ props?.observationDate.toLocaleDateString() }}</small
        >
      </div>
    </div>
  </div>
</template>

<style>
.card-img-top {
  border-radius: 0px !important;
  max-height: 300px !important;
  object-fit: cover;
}
</style>
