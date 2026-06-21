<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  OUTPUT_FORMAT_OPTIONS,
  HIGHWAY_ROUTE_OPTIONS,
  IC_OPTIONS,
} from '../data/dummy'
import { HIGHWAY_TEMPLATE_KEYS } from '../data/highwayTemplates'
import { highwayForm, highwayBomRows, PLACEMENT_STANDARDS } from '../composables/useMockState'
import { useHighwayDerived } from '../composables/useHighwayDerived'
import HighwaySchematic from '../components/HighwaySchematic.vue'
import '../assets/styles/highway.css'

const router = useRouter()

const { templateDef, derivedRegulation, schematicLayout } = useHighwayDerived(highwayForm)

/** 上り系は KP が減少方向（始点 > 終点）、下り系は増加方向 */
watch(
  () => highwayForm.template,
  (tpl) => {
    const isUp = tpl.startsWith('上り')
    highwayForm.constructionKpStart = isUp ? '300.3' : '300.2'
    highwayForm.constructionKpEnd = isUp ? '300.2' : '300.3'
    highwayForm.useManualRegulation = false
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
  router.push('/')
}

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
          <label class="form-label form-label--with-badge">
            テンプレート
            <span class="hw-badge hw-badge--required">必須</span>
          </label>
          <select v-model="highwayForm.template" class="form-input">
            <option v-for="t in HIGHWAY_TEMPLATE_KEYS" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="form-field hw-field">
          <label class="form-label form-label--with-badge">
            路線名
            <span class="hw-badge hw-badge--required">必須</span>
          </label>
          <select v-model="highwayForm.route" class="form-input">
            <option v-for="r in HIGHWAY_ROUTE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>

        <div class="hw-field hw-field--row">
          <div class="form-field hw-field-half">
            <label class="form-label form-label--with-badge">
              IC起点
              <span class="hw-badge hw-badge--required">必須</span>
            </label>
            <select v-model="highwayForm.icFrom" class="form-input">
              <option v-for="ic in IC_OPTIONS" :key="ic" :value="ic">{{ ic }}</option>
            </select>
          </div>
          <div class="form-field hw-field-half">
            <label class="form-label form-label--with-badge">
              IC終点
              <span class="hw-badge hw-badge--required">必須</span>
            </label>
            <select v-model="highwayForm.icTo" class="form-input">
              <option v-for="ic in IC_OPTIONS" :key="ic" :value="ic">{{ ic }}</option>
            </select>
          </div>
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

        <div class="hw-section-divider">
          施工区間 KP
          <span class="hw-badge hw-badge--required">必須</span>
        </div>
        <div class="hw-field hw-field--row hw-field--kp">
          <input v-model="highwayForm.constructionKpStart" type="text" class="form-input" placeholder="始点 AL8" />
          <span class="hw-separator">〜</span>
          <input v-model="highwayForm.constructionKpEnd" type="text" class="form-input" placeholder="終点 AW8" />
        </div>
        <div v-if="derivedRegulation.constructionLengthM !== null" class="hw-kp-length">
          延長 L = {{ Math.abs(derivedRegulation.constructionLengthM) }} m
        </div>

        <div class="hw-section-divider">
          規制区間 KP
          <span class="hw-badge hw-badge--required">必須</span>
        </div>

        <template v-if="!highwayForm.useManualRegulation">
          <div class="hw-derived-kp">
            <span class="hw-derived-kp-value">{{ derivedRegulation.regulationKpStartLabel }}</span>
            <span class="hw-separator">〜</span>
            <span class="hw-derived-kp-value">{{ derivedRegulation.regulationKpEndLabel }}</span>
          </div>
          <p class="hw-derived-note">
            施工区間から自動算出（手前 0.7km / 奥 0.3km）。
            <template v-if="highwayForm.template.startsWith('上り')">上りは KP 始点 &gt; 終点。</template>
            <template v-else>下りは KP 始点 &lt; 終点。</template>
          </p>
          <div v-if="derivedRegulation.regulationLengthM !== null" class="hw-kp-length">
            延長 L = {{ derivedRegulation.regulationLengthM }} m
          </div>
        </template>

        <template v-else>
          <label class="hw-auto-calc-toggle">
            <input v-model="highwayForm.useManualRegulation" type="checkbox" />
            規制区間を手動入力する
          </label>
          <div v-if="highwayForm.useManualRegulation" class="hw-field hw-field--row hw-field--kp">
            <input v-model="highwayForm.manualRegulationKpStart" type="text" class="form-input" placeholder="始点" />
            <span class="hw-separator">〜</span>
            <input v-model="highwayForm.manualRegulationKpEnd" type="text" class="form-input" placeholder="終点" />
          </div>
          <div v-else class="hw-derived-kp hw-derived-kp--empty">—</div>
        </template>

        <button
          type="button"
          class="hw-manual-toggle-link"
          @click="highwayForm.useManualRegulation = !highwayForm.useManualRegulation"
        >
          {{ highwayForm.useManualRegulation ? '自動算出に戻す' : '手動で上書きする' }}
        </button>

        <p class="hw-kp-note">KPは小数第1位（例: 300.2）。入力変更と同時に模式図が更新されます。</p>

        <div class="hw-section-divider">
          規制時間
          <span class="hw-badge hw-badge--required">必須</span>
        </div>
        <div class="hw-field hw-field--row">
          <input v-model="highwayForm.regulationTimeStart" type="time" class="form-input" />
          <span class="hw-separator">〜</span>
          <input v-model="highwayForm.regulationTimeEnd" type="time" class="form-input" />
        </div>
        <div class="hw-field">
          <div class="hw-radio-group">
            <label class="hw-radio"><input v-model="highwayForm.timeOfDay" type="radio" value="day" /> 日中</label>
            <label class="hw-radio"><input v-model="highwayForm.timeOfDay" type="radio" value="night" /> 夜間</label>
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

      <div class="hw-schematic-wrap">
        <div class="hw-schematic-canvas hw-schematic-canvas--excel">
          <HighwaySchematic :layout="schematicLayout" :header="schematicHeader" />
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
        <p class="hw-bom-note">図上配置と連動。品目・単位は標準辞書に準拠します。</p>

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
