<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { MAP_ITEMS } from '../data/dummy'
import { getMapItemImageUrl } from '../data/mapItemImages'
import {
  bomCounts,
  siteForm,
  placedMapItems,
  selectedPlacedId,
  selectPlacedItem,
  placeItemOnMap,
  movePlacedItem,
  removePlacedItem,
  getMapItemName,
} from '../composables/useMockState'
import SiteMapView from '../components/SiteMapView.vue'
import MapToolIcons from '../components/MapToolIcons.vue'
import '../assets/styles/map.css'

const router = useRouter()

const signItems = computed(() => MAP_ITEMS.filter((i) => i.category === 'sign'))
const equipmentItems = computed(() => MAP_ITEMS.filter((i) => i.category === 'equipment'))

/** ピン押下で配置モードに入る対象アイテム */
const placementItemId = ref<string | null>(null)
const isPlacementMode = computed(() => placementItemId.value != null)

const placementItemName = computed(() => {
  const id = placementItemId.value
  if (!id) return null
  return getMapItemName(id)
})

const placedList = computed(() =>
  placedMapItems.value.map((p) => ({
    ...p,
    name: getMapItemName(p.itemId),
    imageUrl: getMapItemImageUrl(p.itemId),
  }))
)

const bomRows = computed(() =>
  MAP_ITEMS.filter((item) => (bomCounts[item.id] ?? 0) > 0).map((item) => ({
    name: item.name,
    qty: bomCounts[item.id],
  }))
)

function enterPlacementMode(itemId: string) {
  if (!getMapItemImageUrl(itemId)) return
  if (placementItemId.value === itemId) {
    placementItemId.value = null
    return
  }
  placementItemId.value = itemId
  selectPlacedItem(null)
}

function onMapPlacement({ lng, lat }: { lng: number; lat: number }) {
  const itemId = placementItemId.value
  if (!itemId) return
  placeItemOnMap(itemId, lng, lat)
  placementItemId.value = null
}

function onSelectPlaced(placementId: string) {
  placementItemId.value = null
  selectPlacedItem(placementId)
}

function onMovePlaced(payload: { placementId: string; lng: number; lat: number }) {
  movePlacedItem(payload.placementId, payload.lng, payload.lat)
}

function removePlacement(placementId: string) {
  removePlacedItem(placementId)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }
  const id = selectedPlacedId.value
  if (!id) return
  e.preventDefault()
  removePlacedItem(id)
}

function exportCsv() {
  const rows = bomRows.value
  if (rows.length === 0) {
    alert('エクスポートする品目がありません')
    return
  }
  const header = '品名,数量'
  const body = rows.map((r) => `"${r.name}",${r.qty}`).join('\n')
  const csv = '\uFEFF' + header + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bom-list.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function saveComplete() {
  alert('保存しました')
}

function goBack() {
  placementItemId.value = null
  selectPlacedItem(null)
  router.push('/')
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="page page-bg-slate map-editor-layout">
    <div class="map-editor-main">
      <aside class="map-panel map-panel--tools">
        <h3 class="map-panel-title">配置アイテム</h3>
        <p v-if="placementItemName" class="map-placement-hint">
          「{{ placementItemName }}」を地図に配置するには地図をクリック
        </p>
        <p v-else class="map-placement-hint map-placement-hint--idle">
          各アイテムの地図ピンで配置／配置済みはドラッグで移動
        </p>

        <div class="map-panel-group">
          <div class="map-panel-group-label">【標識】</div>
          <div
            v-for="item in signItems"
            :key="item.id"
            class="map-item-row"
            :class="{
              'map-item-row--placed': bomCounts[item.id] > 0,
              'map-item-row--active': placementItemId === item.id,
              'map-item-row--disabled': !getMapItemImageUrl(item.id),
            }"
          >
            <img
              v-if="getMapItemImageUrl(item.id)"
              :src="getMapItemImageUrl(item.id)"
              :alt="item.name"
              class="map-item-row-icon"
            />
            <span v-else class="map-item-row-fallback">—</span>
            <span class="map-item-row-name">{{ item.name }}</span>
            <button
              type="button"
              class="map-tool-btn map-tool-btn--pin"
              title="地図をクリックして配置"
              :disabled="!getMapItemImageUrl(item.id)"
              :class="{ 'map-tool-btn--active': placementItemId === item.id }"
              @click="enterPlacementMode(item.id)"
            >
              <MapToolIcons name="pin" />
            </button>
          </div>
        </div>

        <div class="map-panel-group">
          <div class="map-panel-group-label">【資機材】</div>
          <div
            v-for="item in equipmentItems"
            :key="item.id"
            class="map-item-row"
            :class="{
              'map-item-row--placed': bomCounts[item.id] > 0,
              'map-item-row--active': placementItemId === item.id,
              'map-item-row--disabled': !getMapItemImageUrl(item.id),
            }"
          >
            <img
              v-if="getMapItemImageUrl(item.id)"
              :src="getMapItemImageUrl(item.id)"
              :alt="item.name"
              class="map-item-row-icon"
            />
            <span v-else class="map-item-row-fallback">—</span>
            <span class="map-item-row-name">{{ item.name }}</span>
            <button
              type="button"
              class="map-tool-btn map-tool-btn--pin"
              title="地図をクリックして配置"
              :disabled="!getMapItemImageUrl(item.id)"
              :class="{ 'map-tool-btn--active': placementItemId === item.id }"
              @click="enterPlacementMode(item.id)"
            >
              <MapToolIcons name="pin" />
            </button>
          </div>
        </div>

        <div v-if="placedList.length > 0" class="map-placed-list-section">
          <h4 class="map-placed-list-title">配置済み</h4>
          <div
            v-for="item in placedList"
            :key="item.placementId"
            class="map-placed-list-item"
            :class="{ 'map-placed-list-item--selected': selectedPlacedId === item.placementId }"
            role="button"
            tabindex="0"
            @click="onSelectPlaced(item.placementId)"
            @keydown.enter="onSelectPlaced(item.placementId)"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="map-placed-list-thumb"
            />
            <span class="map-placed-list-name">{{ item.name }}</span>
            <button
              type="button"
              class="map-tool-btn map-tool-btn--delete"
              title="削除"
              @click.stop="removePlacement(item.placementId)"
            >
              <MapToolIcons name="trash" />
            </button>
          </div>
        </div>
      </aside>

      <div class="map-area-wrap">
        <div class="map-context-bar">
          <span class="map-context-label">現場</span>
          <span class="map-context-value">{{ siteForm.siteName || '（未入力）' }}</span>
          <span class="map-context-sep">|</span>
          <span class="map-context-label">住所</span>
          <span class="map-context-value">{{ siteForm.siteAddress || '（未入力）' }}</span>
        </div>
        <div class="map-area">
          <SiteMapView
            :address="siteForm.siteAddress"
            :placements="placedMapItems"
            :placement-active="isPlacementMode"
            :selected-placed-id="selectedPlacedId"
            @placement="onMapPlacement"
            @select="onSelectPlaced"
            @deselect="selectPlacedItem(null)"
            @move="onMovePlaced"
          />
        </div>
      </div>

      <aside class="map-panel map-panel--bom">
        <h3 class="map-panel-title">資機材数量表</h3>
        <table v-if="bomRows.length > 0" class="bom-table">
          <thead>
            <tr>
              <th>品名</th>
              <th>数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in bomRows" :key="row.name">
              <td>{{ row.name }}</td>
              <td>{{ row.qty }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="bom-empty">左の配置アイテムを選び、地図に配置すると数量が自動集計されます</p>
        <button type="button" class="btn btn-secondary map-export-btn" @click="exportCsv">
          CSVエクスポート
        </button>
      </aside>
    </div>

    <footer class="map-editor-footer">
      <div class="form-actions-left">
        <button type="button" class="btn btn-back" @click="goBack">戻る</button>
      </div>
      <div class="form-actions-center">
        <button type="button" class="btn btn-action" @click="saveComplete">保存して完了</button>
      </div>
      <div class="form-actions-right"></div>
    </footer>
  </div>
</template>
