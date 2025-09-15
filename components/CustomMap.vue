<template>
  <v-sheet class="travel-map" :height="height">
    <l-map ref="map" :center="center" :zoom="zoom" style="height: 100%;">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <l-marker v-for="marker in markers" :key="marker.id" :lat-lng="[marker.lat, marker.lng]">
        <l-popup>{{ marker.label }}</l-popup>
      </l-marker>
      <l-geo-json v-if="regions" :geojson="regions" :options="regionOptions" />
    </l-map>
  </v-sheet>
</template>
<script setup>
import { ref } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LGeoJson } from '@vue-leaflet/vue-leaflet'

defineProps({
  markers: { type: Array, default: () => [] }, // [{ id, lat, lng, label }]
  regions: { type: Object, default: null }, // GeoJSON для eSIM
  center: { type: Array, default: () => [51.505, -0.09] }, // Default: London
  zoom: { type: Number, default: 13 },
  height: { type: String, default: '50vh' }
})

const regionOptions = {
  style: { color: '#FF5722', fillColor: '#0288D1', fillOpacity: 0.5 } // accent, primary
}
</script>
<style scoped>
.travel-map {
  border-radius: 8px;
  overflow: hidden;
}
</style>
