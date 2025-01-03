<template>
  <div id="map"></div>
</template>

<script setup>
// Leaflet
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { saveMapState, toWKT } from "../lib/utils";
import { parse, stringify } from "wellknown";

// Vue
import { onMounted, ref, shallowRef, watch, watchEffect } from "vue";

// Draw config
import drawConfig from "./MapConfig";

const props = defineProps({
  radius: {
    type: Number,
    default: 10,
  },
  wkt: String,
});

// Component Attributes
const map = shallowRef(); // to store the Leaflet map
const geometry = shallowRef(new L.FeatureGroup()); // to store the displayed geometry
const radius = ref(props.radius); // in km
const wkt = ref(props.wkt);

watchEffect(() => {
  radius.value = props.radius;
  wkt.value = props.wkt;
});

// Component Events
const emit = defineEmits(["wkt", "geojson"]);

// Component Lifecycle
onMounted(() => {
  // Initialize map
  map.value = L.map("map");
  saveMapState(map.value);

  // Add tile layer
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value);

  // if existing value in geometry
  map.value.addLayer(geometry.value);

  // Add draw control
  map.value.addControl(new L.Control.Draw(drawConfig(geometry.value)));

  if (wkt.value) {
    let tmp = L.geoJSON().addTo(geometry.value);
    tmp.addData(parse(wkt.value));
    map.fitBounds(group.getBounds());
  }

  function addLayer(event) {
    let layer = event.layer;
    // Display the new geometry
    geometry.value.clearLayers();
    geometry.value.addLayer(layer);

    // Convert to WKT
    const WKT = toWKT(layer, event.layerType, radius.value);
    // If point or line, we buffer the geometry
    if (event.layerType == "marker" || event.layerType == "polyline") {
      let tmp = L.geoJSON().addTo(geometry.value);
      tmp.addData(parse(WKT));
    }

    emit("wkt", WKT);
  }

  map.value.on(L.Draw.Event.CREATED, addLayer);

  window.addEventListener("beforeunload", function (e) {
    const state = {
      center: map.value.getCenter(),
      zoom: map.value.getZoom(),
    };
    localStorage.setItem("mapState", JSON.stringify(state));
  });

  watch(wkt, () => {
    if (wkt.value) {
      let tmp = L.geoJSON().addTo(geometry.value);
      tmp.addData(parse(wkt.value));
    }
  });
});
</script>

<style scoped>
#map {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
