<template>
  <div class="custom-map-wrapper" :style="{ height }">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface MapMarker {
  id: number | string;
  lat: number;
  lng: number;
  label: string;
}

const props = defineProps<{
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}>();

// Use untyped emits array and cast to any to avoid complex TS overload issues when emitting from nested handlers
const emit = defineEmits(["marker-click", "marker-view", "click"]) as any;

const mapContainer = ref<HTMLElement | null>(null);
let map: LeafletMap | null = null;
let markersLayer: any[] = [];

async function initMap() {
  if (!mapContainer.value) return;

  try {
    // Динамический импорт Leaflet
    const L = await import("leaflet");

    // Инициализация карты
    map = L.map(mapContainer.value).setView(
      props.center || [51.505, -0.09],
      props.zoom || 13,
    );

    // Добавление тайлов OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Обработчик клика по карте
    map.on("click", (e: any) => {
      emit("click", {
        latlng: {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        },
      });
    });

    // Добавление маркеров
    updateMarkers();
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

async function updateMarkers() {
  if (!map) return;
  try {
    const L = await import("leaflet");

    // Удаляем старые маркеры
    markersLayer.forEach((m) => {
      try { m.remove(); } catch (e) { /* ignore */ }
    });
    markersLayer = [];

    // Добавляем новые маркеры
    if (props.markers && props.markers.length > 0) {
      const markerDataById: Record<string, any> = {};

      props.markers.forEach((markerData) => {
        markerDataById[String(markerData.id)] = markerData;

        // Determine security color based on score
        let securityColor = '#999'; // default grey for unknown
        let securityIcon = 'shield-alert';
        if ((markerData as any).securityScore !== undefined) {
          const score = (markerData as any).securityScore;
          if (score >= 0.8) {
            securityColor = '#4CAF50'; // green
            securityIcon = 'shield-check';
          } else if (score >= 0.5) {
            securityColor = '#FF9800'; // orange
            securityIcon = 'shield-half-full';
          } else {
            securityColor = '#F44336'; // red
            securityIcon = 'shield-off';
          }
        }

        // Build one-line popup with SSID and icons
        const popupHtml = `
          <div style="min-width:180px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <div style="font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${escapeHtml(markerData.label || '')}
              </div>
              <div style="display:flex;align-items:center;gap:4px">
                ${(markerData as any).averageRating ? `
                  <span style="display:flex;align-items:center;gap:2px;color:#FFB300">
                    <i class="mdi mdi-star" style="font-size:16px"></i>
                    <span style="font-size:12px">${(markerData as any).averageRating.toFixed(1)}</span>
                  </span>
                ` : ''}
                <i class="mdi mdi-${securityIcon}" style="color:${securityColor};font-size:16px"></i>
              </div>
            </div>
            ${(markerData as any).distance ? `
              <div style="font-size:12px;color:#666;margin-bottom:4px">
                ${escapeHtml(String((markerData as any).distance))}
              </div>
            ` : ''}
            <div style="margin-top:6px;display:flex;gap:8px;justify-content:flex-end">
              <button data-view-id="${markerData.id}" style="background:#0288D1;color:#fff;border:none;padding:6px 8px;border-radius:6px;cursor:pointer">
                ${escapeHtml('Details')}
              </button>
            </div>
          </div>
        `;

        const marker = L.marker([markerData.lat, markerData.lng]).addTo(map!);
        marker.bindPopup(popupHtml, { maxWidth: 260 });
        marker.on("click", () => {
          emit("marker-click", markerData);
        });

        markersLayer.push(marker);
      });

      // Один обработчик popupopen / popupclose для всех маркеров — ищем кнопку внутри popup и пробрасываем событие
      map!.on('popupopen', function(e: any) {
        try {
          const node = e.popup && e.popup._contentNode;
          if (!node) return;
          const btn = node.querySelector('[data-view-id]');
          if (btn) {
            const id = btn.getAttribute('data-view-id');
            const data = markerDataById[id];
            if (!data) return;
            const handler = () => emit('marker-view', data);
            (btn as any).__handler = handler;
            btn.addEventListener('click', handler);
          }
        } catch (err) {
          // ignore
        }
      });

      map!.on('popupclose', function(e: any) {
        try {
          const node = e.popup && e.popup._contentNode;
          if (!node) return;
          const btn = node.querySelector('[data-view-id]');
          if (btn && (btn as any).__handler) {
            btn.removeEventListener('click', (btn as any).__handler);
            delete (btn as any).__handler;
          }
        } catch (err) {
          // ignore
        }
      });
    }
  } catch (error) {
    console.error("Error updating markers:", error);
  }
}

// Простая эскейп-функция для HTML в popup
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function updateMapView() {
  if (!map || !props.center) return;

  try {
    const currentZoom = map.getZoom();
    // Всегда используем текущий зум, если он есть
    map.setView(props.center, currentZoom || props.zoom || 13, {
      animate: false
    });
  } catch (error) {
    console.error("Error updating map view:", error);
  }
}

// Наблюдаем за изменением маркеров
watch(
  () => props.markers,
  () => {
    updateMarkers();
  },
  { deep: true },
);

// Наблюдаем за изменением центра
watch(
  () => props.center,
  () => {
    updateMapView();
  },
  { deep: true },
);

onMounted(async () => {
  // Импортируем CSS Leaflet и Material Design Icons
  if (process.client) {
    await import("leaflet/dist/leaflet.css");
    await import('@mdi/font/css/materialdesignicons.css');
    await nextTick();
    initMap();
  }
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.custom-map-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  z-index: 0;
}

:deep(.leaflet-container) {
  height: 100%;
  width: 100%;
  border-radius: 8px;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-tip-container) {
  display: none;
}
</style>
