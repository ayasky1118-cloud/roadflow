<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  geocodeAddress,
  getMapTilerApiKey,
  getMapTilerStyleUrl,
} from '../composables/useMapTiler'
import { getMapItemImageUrl } from '../data/mapItemImages'
import { getMapItemName } from '../composables/useMockState'
import type { PlacedMapItem } from '../composables/useMockState'

const MAP_PLACED_ICON_SIZE = 48

const props = withDefaults(
  defineProps<{
    address: string
    zoom?: number
    placements?: PlacedMapItem[]
    placementActive?: boolean
    selectedPlacedId?: string | null
  }>(),
  {
    zoom: 16,
    placements: () => [],
    placementActive: false,
    selectedPlacedId: null,
  }
)

const emit = defineEmits<{
  placement: [payload: { lng: number; lat: number }]
  select: [placementId: string]
  deselect: []
  move: [payload: { placementId: string; lng: number; lat: number }]
}>()

const mapContainerRef = ref<HTMLDivElement | null>(null)
const mapRef = shallowRef<maplibregl.Map | null>(null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const displayAddress = ref('')
const mapMoveCounter = ref(0)
const draggingPlacementId = ref<string | null>(null)

const apiKey = getMapTilerApiKey()

const mapReady = computed(
  () => !loading.value && !errorMessage.value && mapRef.value != null
)

const overlayIcons = computed(() => {
  mapMoveCounter.value
  const map = mapRef.value
  if (!map) return []

  return props.placements
    .map((p) => {
      const imageUrl = getMapItemImageUrl(p.itemId)
      if (!imageUrl) return null
      const point = map.project([p.lng, p.lat])
      return {
        placementId: p.placementId,
        itemId: p.itemId,
        name: getMapItemName(p.itemId),
        imageUrl,
        left: point.x,
        top: point.y,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
})

function destroyMap() {
  if (mapRef.value) {
    mapRef.value.remove()
    mapRef.value = null
  }
}

function bindMapEvents(map: maplibregl.Map) {
  const bump = () => {
    if (draggingPlacementId.value) return
    mapMoveCounter.value++
  }
  map.on('move', bump)
  map.on('zoom', bump)
  map.on('resize', bump)
  map.on('click', (e) => {
    if (props.placementActive) {
      emit('placement', { lng: e.lngLat.lng, lat: e.lngLat.lat })
      return
    }
    emit('deselect')
  })
}

function startIconDrag(e: MouseEvent, placementId: string) {
  const map = mapRef.value
  const placement = props.placements.find((p) => p.placementId === placementId)
  if (!map || !placement || props.placementActive) return

  e.preventDefault()
  emit('select', placementId)

  const mapEl = map.getContainer()
  const mapRect = mapEl.getBoundingClientRect()
  const pt = map.project([placement.lng, placement.lat])
  const half = MAP_PLACED_ICON_SIZE / 2
  const offsetX = e.clientX - mapRect.left - (pt.x - half)
  const offsetY = e.clientY - mapRect.top - (pt.y - half)

  draggingPlacementId.value = placementId
  map.dragPan.disable()

  const onMove = (ev: MouseEvent) => {
    const newX = ev.clientX - mapRect.left - offsetX + half
    const newY = ev.clientY - mapRect.top - offsetY + half
    const lngLat = map.unproject([newX, newY])
    emit('move', { placementId, lng: lngLat.lng, lat: lngLat.lat })
    mapMoveCounter.value++
  }

  const onUp = () => {
    draggingPlacementId.value = null
    map.dragPan.enable()
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function onIconMouseDown(e: MouseEvent, placementId: string) {
  if (props.placementActive) return
  startIconDrag(e, placementId)
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
  map.once('load', () => {
    bindMapEvents(map)
    mapMoveCounter.value++
  })
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

watch(
  () => props.placements,
  () => {
    mapMoveCounter.value++
  },
  { deep: true }
)

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

defineExpose({
  getMap: () => mapRef.value,
})
</script>

<template>
  <div
    class="site-map-view"
    :class="{
      'site-map-view--placement': placementActive && mapReady,
      'site-map-view--dragging': draggingPlacementId,
    }"
  >
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
    <div v-else class="site-map-stage">
      <div ref="mapContainerRef" class="site-map-container" />
      <div class="site-map-overlay">
        <div
          v-for="icon in overlayIcons"
          :key="icon.placementId"
          class="map-placed-icon-wrap"
          :class="{
            'map-placed-icon-wrap--selected': selectedPlacedId === icon.placementId,
            'map-placed-icon-wrap--dragging': draggingPlacementId === icon.placementId,
          }"
          :style="{
            left: `${icon.left}px`,
            top: `${icon.top}px`,
            width: `${MAP_PLACED_ICON_SIZE}px`,
            height: `${MAP_PLACED_ICON_SIZE}px`,
          }"
          :title="icon.name"
          @mousedown="onIconMouseDown($event, icon.placementId)"
        >
          <img :src="icon.imageUrl" :alt="icon.name" class="map-placed-icon-img" draggable="false" />
        </div>
      </div>
    </div>
  </div>
</template>
