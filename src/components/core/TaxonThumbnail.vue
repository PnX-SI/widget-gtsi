<script setup>
import { Media } from "@/lib/models";
import { useTemplateRef } from "vue";

const props = defineProps({
  picture: { type: Media },
  audio: { type: Media },
  vernacularName: { type: String },
  acceptedScientificName: { type: String },
  urlDetailPage: { type: String },
});

const audio = useTemplateRef("audio");
</script>
<template>
  <div class="col card thumbnail">
    <img
      class="card-img"
      :src="props.picture?.url"
      :alt="props.picture?.url"
      :title="'Source: ' + props.picture?.source"
    />

    <div class="card-img-overlay">
      <div class="card-title h6">
        <a
          style="color: inherit; text-decoration: inherit"
          :href="props.urlDetailPage"
          target="_blank"
        >
          <span>{{ props.vernacularName }}</span></a
        >
        <div class="player">
          <SingleButtonAudioPlayer
            v-if="props.audio"
            :audio="props.audio"
          ></SingleButtonAudioPlayer>
        </div>
        <BPopover
          v-if="props.picture.source"
          :click="true"
          :close-on-hide="true"
          :delay="{ show: 0, hide: 0 }"
        >
          <template #target>
            <i class="bi bi-c-square-fill copyright-icon"></i>
          </template>
          {{ props.picture.source }}
        </BPopover>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 0;
  align-content: space-around;
}
.card-img {
  object-fit: cover;
  width: 100%;
  aspect-ratio: 1/1;
}
.card-title {
  color: white;
  text-shadow: 2px 2px 2px #333;
}

.copyright-icon {
  margin-left: 0.2em;
  position: absolute;
  bottom: 5px;
  right: 20px;
  color: #fff;
  text-shadow: none;
}
.player {
  margin-left: 0.2em;
  position: absolute;
  bottom: 5px;
  left: 15px;
  color: #fff !important;
  text-shadow: none;
  font-size: 1.4rem;
}
</style>
