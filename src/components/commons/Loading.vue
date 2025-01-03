<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  loadingStatus: Boolean,
  loadingMessage: String,
});

watch(props, () => {
  loadingStatus.value = props.loadingStatus;
});
const loadingStatus = ref(
  props.loadingStatus != null ? props.loadingStatus : false
);
const loadingMessage = ref(
  props.loadingMessage != null ? props.loadingMessage : "Chargement "
);
</script>

<template>
  <div v-if="loadingStatus">
    <div class="d-flex justify-content-center">
      <h3>{{ loadingMessage }}</h3>
    </div>
    <div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">{{ loadingMessage }}</span>
      </div>
    </div>
  </div>
</template>
