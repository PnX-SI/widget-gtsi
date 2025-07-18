<script setup>
import { ref, computed, watch } from "vue";

import { NO_IMAGE_URL } from "@/assets/constant";
import { Media, Taxon } from "@/lib/models";
import ParameterStore from "@/lib/parameterStore";
import { randomChoice } from "@/lib/utils";

// Components
import TaxonThumbnail from "./TaxonThumbnail.vue";
import TaxonDetailed from "./TaxonDetailed.vue";

const { mode, connector, lang, customDetailPage } =
  ParameterStore.getInstance();

const props = defineProps({
  taxon: Taxon,
});

const taxon = props.taxon;
const speciesPhoto = ref([]);
const speciesAudio = ref(null);
const vernacularName = ref(taxon.vernacularName);

function fetchDetailUrl(taxonID) {
  if (customDetailPage.value) {
    const url = customDetailPage.value.replace("{taxonID}", taxonID);
    return url;
  }
  return connector.value.getTaxonDetailPage(taxon.taxonId);
}

function fetchTaxonImage() {
  speciesPhoto.value = [];
  if (taxon.taxonId) {
    connector.value.imageSource
      .fetchPicture(taxon.taxonId, connector.value)
      .then((response) => {
        speciesPhoto.value = response;
      });
  }
}
function fetchTaxonAudio() {
  speciesAudio.value = null;
  if (taxon.taxonId) {
    connector.value.soundSource
      .fetchSound(taxon.taxonId, connector.value)
      .then((response) => {
        speciesAudio.value = response;
      });
  }
}
const mediaDisplayed = computed(() => {
  if (!speciesPhoto.value) {
    return new Media({ url: NO_IMAGE_URL, typeMedia: "image" });
  }
  return speciesPhoto.value.length == 0
    ? new Media({ url: NO_IMAGE_URL, typeMedia: "image" })
    : randomChoice(speciesPhoto.value);
});

function refreshVernacularName() {
  connector.value.fetchVernacularName(taxon.taxonId).then((name) => {
    if (name) {
      vernacularName.value = name.split(",")[0];
    }
  });
}

fetchTaxonImage();
fetchTaxonAudio();
refreshVernacularName();

watch(lang, () => {
  refreshVernacularName();
});
</script>

<template>
  <TaxonThumbnail
    v-if="mode == 'gallery'"
    :picture="mediaDisplayed"
    :audio="speciesAudio"
    :vernacular-name="vernacularName || taxon.acceptedScientificName"
    :url-detail-page="fetchDetailUrl(taxon.taxonId)"
    :accepted-scientific-name="taxon.acceptedScientificName"
  >
  </TaxonThumbnail>
  <TaxonDetailed
    v-else
    :picture="mediaDisplayed"
    :audio="speciesAudio"
    :accepted-scientific-name="taxon.acceptedScientificName"
    :vernacular-name="vernacularName || taxon.acceptedScientificName"
    :url-detail-page="fetchDetailUrl(taxon.taxonId)"
    :nb-observations="taxon?.nbObservations"
    :last-seen-date="taxon?.lastSeenDate"
  />
</template>
