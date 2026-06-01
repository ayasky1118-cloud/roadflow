<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { MAP_ITEMS } from '../data/dummy'
import { bomCounts, siteForm } from '../composables/useMockState'
import SiteMapView from '../components/SiteMapView.vue'
import '../assets/styles/map.css'

const router = useRouter()

const signItems = computed(() => MAP_ITEMS.filter((i) => i.category === 'sign'))
const equipmentItems = computed(() => MAP_ITEMS.filter((i) => i.category === 'equipment'))

const bomRows = computed(() =>
  MAP_ITEMS.filter((item) => (bomCounts[item.id] ?? 0) > 0).map((item) => ({
    name: item.name,
    qty: bomCounts[item.id],
  }))
)

function incrementItem(id: string) {
  bomCounts[id] = (bomCounts[id] ?? 0) + 1
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
  router.push('/')
}
</script>

<template>
  <div class="page page-bg-slate map-editor-layout">
    <div class="map-editor-main">
      <aside class="map-panel">
        <h3 class="map-panel-title">配置アイテム</h3>
        <div class="map-panel-group">
          <div class="map-panel-group-label">【標識】</div>
          <button
            v-for="item in signItems"
            :key="item.id"
            type="button"
            class="map-item-btn"
            :class="{ 'map-item-btn--placed': bomCounts[item.id] > 0 }"
            @click="incrementItem(item.id)"
          >
            <span class="map-item-icon">{{ item.icon }}</span>
            {{ item.name }}
          </button>
        </div>
        <div class="map-panel-group">
          <div class="map-panel-group-label">【資機材】</div>
          <button
            v-for="item in equipmentItems"
            :key="item.id"
            type="button"
            class="map-item-btn"
            :class="{ 'map-item-btn--placed': bomCounts[item.id] > 0 }"
            @click="incrementItem(item.id)"
          >
            <span class="map-item-icon">{{ item.icon }}</span>
            {{ item.name }}
          </button>
        </div>
      </aside>

      <div class="map-area-wrap">
        <div class="map-area">
          <SiteMapView :address="siteForm.siteAddress" />
        </div>
      </div>

      <aside class="map-panel">
        <h3 class="map-panel-title">BOMリスト</h3>
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
        <p v-else class="bom-empty">左パネルからアイテムを配置してください</p>
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
