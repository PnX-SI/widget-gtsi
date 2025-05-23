<script setup>
import { ref, computed, watchEffect } from "vue";

import { taxonClassIcons } from "@/assets/taxonclass2icon";
import { Taxon } from "@/lib/models";
import BadgeTaxon from "./BadgeTaxon.vue";
import ParameterStore from "@/lib/parameterStore";
import { watch } from "vue";

const config = ParameterStore.getInstance();

const props = defineProps({
  taxon: Taxon,
  connector: { type: Object, required: true },
});

const taxon = props.taxon;
const speciesMedia = ref([]);

const vernacularName = ref(taxon.vernacularName);
function refreshVernacularName() {
  props.connector.fetchVernacularName(taxon.taxonId).then((name) => {
    if (name) {
      vernacularName.value = name;
    }
  });
}

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
  if (taxon.taxonId) {
    props.connector.fetchMedia(taxon.taxonId).then((response) => {
      speciesMedia.value = response;
    });
  }
}

const kingdomColor = computed(() => {
  return taxon.kingdom == "Plantae" ? "#27ae60" : "#e67e22";
});

const kingdomIcon = computed(() => {
  return taxon.kingdom == "Plantae"
    ? "fa-solid fa-seedling"
    : "fa-solid fa-paw";
});

const classIcon = computed(() => {
  try {
    return taxonClassIcons[taxon.kingdom][taxon.class]["Icon"];
  } catch (error) {
    return "";
  }
});

const pageLink = computed(() => {
  return props.connector.getTaxonDetailPage(taxon.taxonId);
});

watchEffect(() => {
  // if any of props changes
  refreshTaxonImage();
});

refreshVernacularName();

watch(config.lang, () => {
  refreshVernacularName();
});
</script>
<template>
  <div class="col">
    <div class="card h-100">
      <div class="taxon-photo">
        <BadgeTaxon
          :class-icon="kingdomIcon"
          id="badge-kingdom"
          :background-color="kingdomColor"
          :tooltip="taxon.kingdom"
        ></BadgeTaxon>
        <BadgeTaxon
          :class-icon="classIcon"
          id="badge-class"
          background-color="#8e44ad"
          :tooltip="taxon.class"
        ></BadgeTaxon>
        <img
          :src="speciesMediaShowed?.url"
          :alt="speciesMediaShowed?.url"
          :title="'Source: ' + speciesMediaShowed?.source"
        />
        <span class="caption" v-if="speciesMediaShowed.source">{{
          speciesMediaShowed.source
        }}</span>
      </div>

      <div class="card-body">
        <div class="card-text">
          <h5 class="card-title text-wrap">
            {{ vernacularName || taxon.acceptedScientificName }}
          </h5>
          <small class="text-body-secondary"
            ><strong>{{ $t("taxon.scientificName") }} :</strong>
            {{ taxon.acceptedScientificName }}</small
          ><br />

          <small class="text-body-secondary">
            <strong>{{ $t("taxon.nbObservations") }} : </strong
            >{{ taxon.nbObservations }}
          </small>
          <br />

          <small class="text-body-secondary">
            <!-- prettier-ignore -->
            <a
              :href="pageLink"
              target="_blank"
              class="badge bg-light text-primary border border-primary text-decoration-none"
              ><strong>{{ $t("taxon.seeMore") }} <i class="bi bi-arrow-right"></i> </strong>
            </a>
          </small>
          <br />
        </div>
      </div>
      <div class="card-footer">
        <small class="text-body-secondary"
          >{{ $t("taxon.lastSeenDate") }} :
          {{ taxon?.lastSeenDate.toLocaleDateString() }}</small
        >
      </div>
    </div>
  </div>
</template>

<style>
.taxon-photo {
  position: relative;
  display: inline-block;
}

.taxon-photo > img {
  object-fit: cover;
  height: 250px !important;
  border-radius: 0px !important;
  width: 100%;
}

#badge-kingdom.badgeTaxon {
  position: absolute;
  top: 10px;
  right: 10px;
}

#badge-class.badgeTaxon {
  position: absolute;
  top: 10px;
  right: 60px;
}

.caption {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 100%;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
  border-radius: 3px;
}
</style>
