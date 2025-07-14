<script setup>
import ParameterStore from "@/lib/parameterStore";
import { ref, watch, watchEffect } from "vue";
import { getMediaSource } from "@/lib/media/media";
const { connector } = ParameterStore.getInstance();

const props = defineProps({
  mediaSourceID: {
    type: String,
    required: true,
  },
  typeMedia: {
    type: String,
    required: true,
    validator(value, props) {
      return ["image", "sound"].includes(value);
    },
  },
});

const mediaSourceID = ref(props.mediaSourceID);

// watchEffect();
watch(
  connector,
  () => {
    mediaSourceID.value = props.mediaSourceID;
  },
  { deep: false }
);

watch(mediaSourceID, () => {
  const otherMediaKey = `${
    props.typeMedia == "image" ? "sound" : "image"
  }Source`;
  const newMediaParams = {
    [props.typeMedia + "Source"]: getMediaSource(mediaSourceID.value),
    [otherMediaKey]: getMediaSource(connector.value[otherMediaKey].id),
  };
  connector.value = new connector.value.constructor(
    Object.assign({}, connector.value.getParams(), newMediaParams)
  );
});
</script>
<template>
  <label for="mediaSourceSelect"
    ><strong>
      {{ $t(`media.${typeMedia}`) }}
      <i class="fa-solid fa-photo-film"></i> </strong
  ></label>
  <BFormSelect
    id="mediaSourceSelect"
    :options="connector.getCompatibleMediaSource()"
    v-model="mediaSourceID"
  >
    <template #first>
      <BFormSelectOption :value="null" disabled>{{
        $t("media.select")
      }}</BFormSelectOption>
    </template>
  </BFormSelect>
</template>
