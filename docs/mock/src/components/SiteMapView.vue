<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  geocodeAddress,
  getMapTilerApiKey,
  getMapTilerStyleUrl,
} from '../composables/useMapTiler'

const props = withDefaults(
  defineProps<{
    address: string
    zoom?: number
  }>(),
  { zoom: 16 }
)

const mapContainerRef = ref<HTMLDivElement | null>(null)
const mapRef = shallowRef<maplibregl.Map | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const displayAddress = ref('')

const apiKey = getMapTilerApiKey()

function destroyMap() {
  if (mapRef.value) {
    mapRef.value.remove()
    mapRef.value = null
  }
}

function initMap(center: [number, number]) {
  if (!mapContainerRef.value || !apiKey) return

  destroyMap()

  const map = new maplibregl.Map({
    container: mapContainerRef.value,
    style: getMapTilerStyleUrl(apiKey),
    center,
    zoom: props.zoom,
    interactive: true,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  })

  map.on('styleimagemissing', (e) => {
    if (map.hasImage(e.id)) return
    const size = 32
    const data = new Uint8ClampedArray(size * size * 4)
    map.addImage(e.id, {
      width: size,
      height: size,
      data,
      sdf: true,
    } as maplibregl.StyleImageInterface)
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')
  mapRef.value = map
}

async function loadMapForAddress(address: string) {
  const trimmed = address.trim()
  displayAddress.value = trimmed
  errorMessage.value = null

  if (!trimmed) {
    destroyMap()
    errorMessage.value = '現場住所が入力されていません。発注受付画面で住所を入力してください。'
    return
  }

  loading.value = true
  destroyMap()

  try {
    const { lat, lng } = await geocodeAddress(trimmed, apiKey)
    loading.value = false
    await nextTick()
    initMap([lng, lat])
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '住所の検索に失敗しました。'
    loading.value = false
  }
}

onMounted(() => {
  loadMapForAddress(props.address)
})

watch(
  () => props.address,
  (addr) => {
    loadMapForAddress(addr)
  }
)

onBeforeUnmount(() => {
  destroyMap()
})
</script>

<template>
  <div class="site-map-view">
    <div v-if="loading" class="map-area-placeholder">
      <p>住所から地図を読み込んでいます…</p>
      <p v-if="displayAddress" class="site-map-view-address">{{ displayAddress }}</p>
    </div>
    <div v-else-if="errorMessage" class="map-area-placeholder map-area-placeholder--error">
      <p>{{ errorMessage }}</p>
      <p v-if="displayAddress" class="site-map-view-address">{{ displayAddress }}</p>
      <button type="button" class="btn btn-secondary site-map-retry" @click="loadMapForAddress(address)">
        再検索
      </button>
    </div>
    <div v-else ref="mapContainerRef" class="site-map-container" />
  </div>
</template>
