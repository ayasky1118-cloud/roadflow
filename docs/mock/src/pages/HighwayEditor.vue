<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  OUTPUT_FORMAT_OPTIONS,
  HIGHWAY_ROUTE_OPTIONS,
  IC_OPTIONS,
} from '../data/dummy'
import { HIGHWAY_TEMPLATE_KEYS, HIGHWAY_LEGEND_ITEMS } from '../data/highwayTemplates'
import {
  highwayForm,
  highwayBomRows,
  PLACEMENT_STANDARDS,
  placedSchematicItems,
  selectedSchematicPlacementId,
  selectSchematicPlacement,
  placeSchematicIcon,
  moveSchematicPlacement,
  removeSchematicPlacement,
  countSchematicPlacements,
} from '../composables/useMockState'
import { useHighwayDerived } from '../composables/useHighwayDerived'
import {
  getHighwayLegendImageUrl,
  getHighwayPlacedIconSize,
} from '../data/highwayLegendImages'
import type { HighwayLegendIconType } from '../data/highwayLegendImages'
import HighwaySchematic from '../components/HighwaySchematic.vue'
import MapToolIcons from '../components/MapToolIcons.vue'
import '../assets/styles/highway.css'
import '../assets/styles/map.css'

const router = useRouter()

const { templateDef, autoDerivedRegulation, derivedRegulation, schematicLayout } =
  useHighwayDerived(highwayForm)

/** ピン押下で配置モードに入る対象アイコン */
const placementIcon = ref<HighwayLegendIconType | null>(null)
const isPlacementMode = computed(() => placementIcon.value != null)

const placedList = computed(() =>
  placedSchematicItems.value.map((placement) => ({
    ...placement,
    label: HIGHWAY_LEGEND_ITEMS.find((item) => item.icon === placement.icon)?.label ?? placement.icon,
    imageUrl: getHighwayLegendImageUrl(placement.icon),
  }))
)

/** 上り系は KP が減少方向（始点 > 終点）、下り系は増加方向 */
watch(
  () => highwayForm.template,
  (tpl) => {
    const isUp = tpl.startsWith('上り')
    highwayForm.constructionKpStart = isUp ? '300.3' : '300.2'
    highwayForm.constructionKpEnd = isUp ? '300.2' : '300.3'
    highwayForm.useManualRegulation = false
    highwayForm.manualRegulationKpStart = ''
    highwayForm.manualRegulationKpEnd = ''
  }
)

watch(
  () => highwayForm.useManualRegulation,
  (manual) => {
    if (manual) {
      const auto = autoDerivedRegulation.value
      if (auto.regulationKpStartLabel !== '—') {
        highwayForm.manualRegulationKpStart = auto.regulationKpStartLabel
        highwayForm.manualRegulationKpEnd = auto.regulationKpEndLabel
      }
    }
  }
)

const schematicHeader = computed(() => ({
  regulationNo: highwayForm.regulationNo,
  directionLabel: templateDef.value?.directionLabel ?? '—',
  laneType: templateDef.value?.laneType ?? '—',
  section: highwayForm.section,
  icFrom: highwayForm.icFrom,
  icTo: highwayForm.icTo,
  constructionKpStart: highwayForm.constructionKpStart,
  constructionKpEnd: highwayForm.constructionKpEnd,
  constructionLengthM: derivedRegulation.value.constructionLengthM,
  regulationKpStart: derivedRegulation.value.regulationKpStartLabel,
  regulationKpEnd: derivedRegulation.value.regulationKpEndLabel,
  regulationLengthM: derivedRegulation.value.regulationLengthM,
  regulationTimeStart: highwayForm.regulationTimeStart,
  regulationTimeEnd: highwayForm.regulationTimeEnd,
}))

function goBack() {
  placementIcon.value = null
  selectSchematicPlacement(null)
  router.push('/')
}

function enterPlacementMode(icon: HighwayLegendIconType) {
  if (!getHighwayLegendImageUrl(icon)) return
  if (placementIcon.value === icon) {
    placementIcon.value = null
    return
  }
  placementIcon.value = icon
  selectSchematicPlacement(null)
}

function onSchematicPlacement({ x, y }: { x: number; y: number }) {
  const icon = placementIcon.value
  if (!icon) return
  const [w, h] = getHighwayPlacedIconSize(icon)
  placeSchematicIcon(icon, x - w / 2, y - h / 2)
  placementIcon.value = null
}

function onSelectPlacement(placementId: string) {
  placementIcon.value = null
  selectSchematicPlacement(placementId)
}

function onMovePlacement(payload: { placementId: string; x: number; y: number }) {
  moveSchematicPlacement(payload.placementId, payload.x, payload.y)
}

function removePlacement(placementId: string) {
  removeSchematicPlacement(placementId)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }
  const id = selectedSchematicPlacementId.value
  if (!id) return
  e.preventDefault()
  removeSchematicPlacement(id)
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function saveComplete() {
  alert('保存しました（高速規制図）')
}

function exportCsv() {
  const rows = highwayBomRows.value
  const header = '品目,品質・規格,数量,単位,調達区分'
  const body = rows
    .map(
      (r) =>
        `"${r.name}","${r.spec}",${r.qty},"${r.unit}","${r.procurement === 'owner' ? '発注者貸与' : '受注者'}"`
    )
    .join('\n')
  const csv = '﻿' + header + '\n' + body
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `highway-bom-${highwayForm.regulationNo}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page page-bg-slate hw-layout">
    <div class="hw-format-bar">
      <span class="hw-format-bar-label">出力様式</span>
      <div class="hw-format-options">
        <label v-for="opt in OUTPUT_FORMAT_OPTIONS" :key="opt.value" class="hw-format-radio">
          <input
            v-model="highwayForm.outputFormat"
            type="radio"
            name="outputFormat"
            :value="opt.value"
          />
          <span class="hw-format-label">
            {{ opt.label }}
            <small>{{ opt.desc }}</small>
          </span>
        </label>
      </div>
    </div>

    <div class="hw-main">
      <aside class="hw-panel hw-panel--input">
        <h3 class="hw-panel-title">規制情報入力</h3>

        <div class="form-field hw-field">
          <label class="form-label">
            テンプレート
          </label>
          <select v-model="highwayForm.template" class="form-input">
            <option v-for="t in HIGHWAY_TEMPLATE_KEYS" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="hw-field hw-field--row">
          <div class="form-field hw-field-half">
            <label class="form-label form-label--with-badge">
              規制番号
              <span class="hw-badge hw-badge--recommend">推奨</span>
            </label>
            <input v-model="highwayForm.regulationNo" type="text" class="form-input" placeholder="例: 1, 3-1" />
          </div>
          <div class="form-field hw-field-half">
            <label class="form-label form-label--with-badge">
              工区
              <span class="hw-badge hw-badge--recommend">推奨</span>
            </label>
            <input v-model="highwayForm.section" type="text" class="form-input" placeholder="例: 1工区" />
          </div>
        </div>

        <div class="form-field hw-field">
          <label class="form-label">
            路線名
          </label>
          <select v-model="highwayForm.route" class="form-input">
            <option v-for="r in HIGHWAY_ROUTE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="hw-field hw-field--row">
          <div class="form-field hw-field-half">
            <label class="form-label">
              IC起点
            </label>
            <select v-model="highwayForm.icFrom" class="form-input">
              <option v-for="ic in IC_OPTIONS" :key="ic" :value="ic">{{ ic }}</option>
            </select>
          </div>
          <div class="form-field hw-field-half">
            <label class="form-label">
              IC終点
            </label>
            <select v-model="highwayForm.icTo" class="form-input">
              <option v-for="ic in IC_OPTIONS" :key="ic" :value="ic">{{ ic }}</option>
            </select>
          </div>
        </div>

        <div class="hw-section-divider">
          施工区間 KP
        </div>
        <div class="hw-field hw-field--row hw-field--kp">
          <div class="hw-kp-wrap">
            <input
              v-model="highwayForm.constructionKpStart"
              type="text"
              class="form-input hw-kp-input"
              placeholder="起点"
              inputmode="decimal"
            />
            <span class="hw-kp-unit">KP</span>
          </div>
          <span class="hw-separator">〜</span>
          <div class="hw-kp-wrap">
            <input
              v-model="highwayForm.constructionKpEnd"
              type="text"
              class="form-input hw-kp-input"
              placeholder="終点"
              inputmode="decimal"
            />
            <span class="hw-kp-unit">KP</span>
          </div>
        </div>

        <div class="hw-section-divider">
          規制区間 KP
        </div>

        <label class="hw-auto-calc-toggle">
          <input v-model="highwayForm.useManualRegulation" type="checkbox" />
          規制区間を手動入力する
        </label>

        <div class="hw-field hw-field--row hw-field--kp">
          <div class="hw-kp-wrap">
            <input
              v-if="highwayForm.useManualRegulation"
              v-model="highwayForm.manualRegulationKpStart"
              type="text"
              class="form-input hw-kp-input"
              placeholder="起点"
              inputmode="decimal"
            />
            <input
              v-else
              :value="autoDerivedRegulation.regulationKpStartLabel"
              type="text"
              class="form-input hw-kp-input"
              disabled
              readonly
            />
            <span class="hw-kp-unit">KP</span>
          </div>
          <span class="hw-separator">〜</span>
          <div class="hw-kp-wrap">
            <input
              v-if="highwayForm.useManualRegulation"
              v-model="highwayForm.manualRegulationKpEnd"
              type="text"
              class="form-input hw-kp-input"
              placeholder="終点"
              inputmode="decimal"
            />
            <input
              v-else
              :value="autoDerivedRegulation.regulationKpEndLabel"
              type="text"
              class="form-input hw-kp-input"
              disabled
              readonly
            />
            <span class="hw-kp-unit">KP</span>
          </div>
        </div>

        <div class="hw-section-divider">
          規制時間
        </div>
        <div class="hw-field hw-field--row hw-field--kp">
          <div class="hw-kp-wrap">
            <input v-model="highwayForm.regulationTimeStart" type="time" class="form-input" />
          </div>
          <span class="hw-separator">〜</span>
          <div class="hw-kp-wrap">
            <input v-model="highwayForm.regulationTimeEnd" type="time" class="form-input" />
          </div>
        </div>

        <div class="hw-section-divider">
          補足情報
          <span class="hw-badge hw-badge--optional">任意</span>
        </div>
        <div class="form-field hw-field">
          <textarea
            v-model="highwayForm.trafficNote"
            class="form-input hw-textarea"
            rows="3"
            placeholder="断面交通量・特記事項等"
          ></textarea>
        </div>
      </aside>

      <aside class="map-panel map-panel--tools hw-placement-panel">
        <h3 class="map-panel-title">配置アイテム</h3>

        <div class="map-panel-group">
          <div
            v-for="item in HIGHWAY_LEGEND_ITEMS"
            :key="item.icon"
            class="map-item-row"
            :class="{
              'map-item-row--placed': countSchematicPlacements(item.icon) > 0,
              'map-item-row--active': placementIcon === item.icon,
              'map-item-row--disabled': !getHighwayLegendImageUrl(item.icon),
            }"
          >
            <img
              v-if="getHighwayLegendImageUrl(item.icon)"
              :src="getHighwayLegendImageUrl(item.icon)"
              :alt="item.label"
              class="map-item-row-icon"
            />
            <span v-else class="map-item-row-fallback">—</span>
            <span class="map-item-row-name">{{ item.label }}</span>
            <button
              type="button"
              class="map-tool-btn map-tool-btn--pin"
              title="模式図をクリックして配置"
              :disabled="!getHighwayLegendImageUrl(item.icon)"
              :class="{ 'map-tool-btn--active': placementIcon === item.icon }"
              @click="enterPlacementMode(item.icon)"
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
            :class="{ 'map-placed-list-item--selected': selectedSchematicPlacementId === item.placementId }"
            role="button"
            tabindex="0"
            @click="onSelectPlacement(item.placementId)"
            @keydown.enter="onSelectPlacement(item.placementId)"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.label"
              class="map-placed-list-thumb"
            />
            <span class="map-placed-list-name">{{ item.label }}</span>
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

      <div class="hw-schematic-wrap">
        <div
          class="hw-schematic-canvas hw-schematic-canvas--excel"
          :class="{ 'hw-schematic-canvas--placement': isPlacementMode }"
        >
          <div class="hw-schematic-sheet">
            <HighwaySchematic
              :layout="schematicLayout"
              :header="schematicHeader"
              :placements="placedSchematicItems"
              :placement-active="isPlacementMode"
              :selected-placement-id="selectedSchematicPlacementId"
              @placement="onSchematicPlacement"
              @select="onSelectPlacement"
              @deselect="selectSchematicPlacement(null)"
              @move="onMovePlacement"
            />

            <div class="hw-legend-section">
              <h3 class="map-panel-title">凡例</h3>
              <div class="hw-legend-items">
                <div
                  v-for="item in HIGHWAY_LEGEND_ITEMS"
                  :key="item.icon"
                  class="map-item-row hw-legend-item-row"
                >
                  <img
                    v-if="getHighwayLegendImageUrl(item.icon)"
                    :src="getHighwayLegendImageUrl(item.icon)"
                    :alt="item.label"
                    class="map-item-row-icon"
                  />
                  <span v-else class="map-item-row-fallback">—</span>
                  <span class="map-item-row-name">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hw-standards-panel">
          <div class="hw-standards-title">標準配置基準（マスタ参照）</div>
          <div class="hw-standards-grid">
            <div v-for="s in PLACEMENT_STANDARDS" :key="s.label" class="hw-standards-item">
              <span class="hw-standards-label">{{ s.label }}</span>
              <span class="hw-standards-value">{{ s.value }}</span>
              <span class="hw-standards-note">{{ s.note }}</span>
            </div>
          </div>
        </div>
      </div>

      <aside class="hw-panel hw-panel--bom">
        <h3 class="hw-panel-title">資機材数量表</h3>
        <p class="hw-bom-note">凡例アイテムの配置数が自動集計されます（凡例対象品目のみ）。</p>

        <table class="hw-bom-table">
          <thead>
            <tr>
              <th>品目</th>
              <th>品質・規格</th>
              <th class="hw-bom-qty">数量</th>
              <th>単位</th>
              <th>調達区分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in highwayBomRows" :key="row.id">
              <td>{{ row.name }}</td>
              <td class="hw-bom-spec">{{ row.spec }}</td>
              <td class="hw-bom-qty">
                <input v-model.number="row.qty" type="number" min="0" class="hw-bom-qty-input" />
              </td>
              <td>{{ row.unit }}</td>
              <td>
                <span
                  class="hw-procurement-badge"
                  :class="
                    row.procurement === 'owner'
                      ? 'hw-procurement-badge--owner'
                      : 'hw-procurement-badge--contractor'
                  "
                >
                  {{ row.procurement === 'owner' ? '発注者貸与' : '受注者' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="hw-bom-footer-note">
          調達区分は発注者貸与／受注者を資機材ごとに管理します。
        </div>

        <button type="button" class="btn btn-secondary hw-export-btn" @click="exportCsv">
          CSVエクスポート
        </button>
      </aside>
    </div>

    <footer class="hw-footer">
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
