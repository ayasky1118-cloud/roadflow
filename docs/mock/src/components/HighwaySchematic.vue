<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import type { SchematicLayout } from '../utils/highwaySchematic'
import type { HighwayIconType } from '../data/highwayTemplates'
import type { PlacedSchematicItem } from '../composables/useMockState'
import { getHighwayLegendImageUrl, getHighwayPlacedIconSize } from '../data/highwayLegendImages'
import coneImg from '../assets/images/highway/image1.png'
import advanceSignImg from '../assets/images/highway/image2.png'
import warningLightImg from '../assets/images/highway/image3.png'
import arrowBoardImg from '../assets/images/highway/image4.png'
import cushionImg from '../assets/images/highway/image5.png'
import trafficRouteImg from '../assets/images/highway/image6.png'

export interface SchematicHeader {
  regulationNo: string
  directionLabel: string
  laneType: string
  section: string
  icFrom: string
  icTo: string
  constructionKpStart: string
  constructionKpEnd: string
  constructionLengthM: number | null
  regulationKpStart: string
  regulationKpEnd: string
  regulationLengthM: number | null
  regulationTimeStart: string
  regulationTimeEnd: string
}

const props = withDefaults(
  defineProps<{
    layout: SchematicLayout
    header: SchematicHeader
    placements?: PlacedSchematicItem[]
    placementActive?: boolean
    selectedPlacementId?: string | null
  }>(),
  {
    placements: () => [],
    placementActive: false,
    selectedPlacementId: null,
  }
)

const emit = defineEmits<{
  placement: [payload: { x: number; y: number }]
  select: [placementId: string]
  deselect: []
  move: [payload: { placementId: string; x: number; y: number }]
}>()

const svgRef = ref<SVGSVGElement | null>(null)
const draggingPlacementId = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

const iconSrc: Partial<Record<HighwayIconType | 'monitor', string>> = {
  cone: coneImg,
  'sign-car': advanceSignImg,
  'warning-light': warningLightImg,
  'arrow-board': arrowBoardImg,
  cushion: cushionImg,
  'traffic-route': trafficRouteImg,
  'advance-sign': advanceSignImg,
  guard: cushionImg,
}

const placedIconViews = computed(() =>
  props.placements
    .map((placement) => {
      const [w, h] = getHighwayPlacedIconSize(placement.icon)
      const imageUrl = getHighwayLegendImageUrl(placement.icon)
      if (!imageUrl) return null
      return { ...placement, w, h, imageUrl }
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
)

function regulatedBand(layout: SchematicLayout) {
  return layout.bands.find((b) => b.isRegulated)
}

function taperPointsOffset(layout: SchematicLayout): string | null {
  if (!layout.taperPoints) return null
  return layout.taperPoints
}

function clampX(layout: SchematicLayout, x: number, w: number) {
  return Math.max(layout.diagramX, Math.min(x, layout.diagramX + layout.diagramW - w))
}

function clientToSvg(clientX: number, clientY: number): { x: number; y: number } | null {
  const svg = svgRef.value
  if (!svg) return null
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const svgPt = pt.matrixTransform(ctm.inverse())
  return { x: svgPt.x, y: svgPt.y }
}

function isInDiagram(x: number, y: number): boolean {
  if (!props.layout.ready) return false
  const { diagramX, diagramW, diagramTop, diagramHeight } = props.layout
  return x >= diagramX && x <= diagramX + diagramW && y >= diagramTop && y <= diagramTop + diagramHeight
}

function clampPlacement(x: number, y: number, w: number, h: number) {
  const { diagramX, diagramW, diagramTop, diagramHeight } = props.layout
  return {
    x: Math.max(diagramX, Math.min(x, diagramX + diagramW - w)),
    y: Math.max(diagramTop, Math.min(y, diagramTop + diagramHeight - h)),
  }
}

function onDiagramBackgroundClick(e: MouseEvent) {
  const pt = clientToSvg(e.clientX, e.clientY)
  if (!pt || !isInDiagram(pt.x, pt.y)) return
  if (props.placementActive) {
    emit('placement', { x: pt.x, y: pt.y })
    return
  }
  emit('deselect')
}

function onPlacementMouseDown(e: MouseEvent, placementId: string) {
  e.stopPropagation()
  if (props.placementActive) return
  e.preventDefault()
  const placement = props.placements.find((p) => p.placementId === placementId)
  const view = placedIconViews.value.find((p) => p.placementId === placementId)
  if (!placement || !view) return
  emit('select', placementId)
  draggingPlacementId.value = placementId
  const pt = clientToSvg(e.clientX, e.clientY)
  if (!pt) return
  dragOffset.value = { x: pt.x - placement.x, y: pt.y - placement.y }
  document.addEventListener('mousemove', onDocumentMouseMove)
  document.addEventListener('mouseup', onDocumentMouseUp)
}

function onDocumentMouseMove(e: MouseEvent) {
  const placementId = draggingPlacementId.value
  if (!placementId) return
  const placement = props.placements.find((p) => p.placementId === placementId)
  const view = placedIconViews.value.find((p) => p.placementId === placementId)
  if (!placement || !view) return
  const pt = clientToSvg(e.clientX, e.clientY)
  if (!pt) return
  const next = clampPlacement(pt.x - dragOffset.value.x, pt.y - dragOffset.value.y, view.w, view.h)
  emit('move', { placementId, x: next.x, y: next.y })
}

function onDocumentMouseUp() {
  draggingPlacementId.value = null
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDocumentMouseMove)
  document.removeEventListener('mouseup', onDocumentMouseUp)
})
</script>

<template>
  <svg
    ref="svgRef"
    viewBox="0 0 920 380"
    xmlns="http://www.w3.org/2000/svg"
    class="hw-svg hw-svg--excel"
    :class="{
      'hw-svg--placement': placementActive,
      'hw-svg--dragging': draggingPlacementId,
    }"
    role="img"
    aria-label="高速規制図"
  >
    <rect width="920" height="380" fill="white" />

    <defs>
      <pattern id="hw-grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="0.5" />
      </pattern>
      <pattern id="hw-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#ca8a04" stroke-width="1.5" />
      </pattern>
    </defs>

    <!-- Excel ヘッダー表 -->
    <g class="hw-excel-header">
      <rect x="8" y="10" width="904" height="100" fill="#fafafa" stroke="#94a3b8" stroke-width="1" />

      <text x="20" y="32" font-size="9" fill="#374151" font-family="'Noto Sans JP', sans-serif">規制番号</text>
      <text x="20" y="50" font-size="9" fill="#374151">上下線</text>
      <text x="20" y="68" font-size="9" fill="#374151">車線区分</text>
      <text x="20" y="86" font-size="9" fill="#374151">IC</text>

      <text x="72" y="32" font-size="10" font-weight="600" fill="#111827">{{ header.regulationNo }}</text>
      <text x="72" y="50" font-size="10" fill="#111827">{{ header.directionLabel }}</text>
      <text x="72" y="68" font-size="10" fill="#111827">{{ header.laneType }}</text>
      <text x="72" y="86" font-size="10" fill="#111827">{{ header.icFrom }} 〜 {{ header.icTo }}</text>

      <line x1="160" y1="14" x2="160" y2="106" stroke="#cbd5e1" />

      <text x="172" y="32" font-size="9" fill="#374151" font-weight="600">【施工区間】</text>
      <text x="248" y="32" font-size="9" fill="#6b7280">KP</text>
      <text x="310" y="32" font-size="10" fill="#111827">{{ header.constructionKpStart }}</text>
      <text x="348" y="32" font-size="9" fill="#6b7280">〜 KP</text>
      <text x="382" y="32" font-size="10" fill="#111827">{{ header.constructionKpEnd }}</text>
      <text x="430" y="32" font-size="9" fill="#6b7280">L=</text>
      <text x="448" y="32" font-size="10" fill="#111827">{{ header.constructionLengthM ?? '—' }}</text>
      <text x="488" y="32" font-size="9" fill="#6b7280">m</text>

      <text x="172" y="54" font-size="9" fill="#374151" font-weight="600">【規制区間】</text>
      <text x="248" y="54" font-size="9" fill="#6b7280">KP</text>
      <text x="310" y="54" font-size="10" fill="#111827">{{ header.regulationKpStart }}</text>
      <text x="348" y="54" font-size="9" fill="#6b7280">〜 KP</text>
      <text x="382" y="54" font-size="10" fill="#111827">{{ header.regulationKpEnd }}</text>
      <text x="430" y="54" font-size="9" fill="#6b7280">L=</text>
      <text x="448" y="54" font-size="10" fill="#111827">{{ header.regulationLengthM ?? '—' }}</text>
      <text x="488" y="54" font-size="9" fill="#6b7280">m</text>

      <text x="172" y="76" font-size="9" fill="#374151" font-weight="600">【規制時間】</text>
      <text x="248" y="76" font-size="10" fill="#111827">{{ header.regulationTimeStart }}</text>
      <text x="310" y="76" font-size="9" fill="#6b7280">〜</text>
      <text x="328" y="76" font-size="10" fill="#111827">{{ header.regulationTimeEnd }}</text>

      <text x="172" y="96" font-size="9" fill="#374151" font-weight="600">工区</text>
      <text x="210" y="96" font-size="10" fill="#111827">{{ header.section || '—' }}</text>
    </g>

    <template v-if="layout.ready">
      <text x="layout.diagramX" :y="layout.diagramTop - 6" font-size="8" fill="#6b7280" font-family="'Noto Sans JP', sans-serif">
        {{ layout.upstreamLabel }}
      </text>
      <text
        :x="layout.diagramX + layout.diagramW"
        :y="layout.diagramTop - 6"
        font-size="8"
        fill="#6b7280"
        text-anchor="end"
        font-family="'Noto Sans JP', sans-serif"
      >
        {{ layout.downstreamLabel }}
      </text>

      <rect
        :x="layout.diagramX"
        :y="layout.diagramTop"
        :width="layout.diagramW"
        :height="layout.diagramHeight"
        fill="url(#hw-grid)"
        stroke="#374151"
        stroke-width="1.2"
      />

      <g v-for="band in layout.bands" :key="band.id">
        <rect
          :x="layout.diagramX"
          :y="band.y"
          :width="layout.diagramW"
          :height="band.h"
          :fill="band.fill"
          :stroke="band.stroke"
          stroke-width="0.5"
        />
        <text
          :x="layout.diagramX + layout.diagramW + 8"
          :y="band.y + band.h / 2 + 4"
          font-size="9"
          fill="#374151"
          :font-weight="band.isRegulated ? '700' : '400'"
          font-family="'Noto Sans JP', sans-serif"
        >
          {{ band.label }}
        </text>
      </g>

      <!-- 規制・作業・テーパー等 -->
      <rect
        v-if="layout.regulationZone"
        :x="layout.regulationZone.x1"
        :y="layout.diagramTop"
        :width="layout.regulationZone.x2 - layout.regulationZone.x1"
        :height="layout.diagramHeight"
        fill="#fef9c3"
        opacity="0.35"
      />

      <g v-if="layout.workZone">
        <rect
          :x="layout.workZone.x1"
          :y="layout.workZone.y"
          :width="layout.workZone.x2 - layout.workZone.x1"
          :height="layout.workZone.h"
          fill="url(#hw-hatch)"
          opacity="0.6"
        />
        <rect
          :x="layout.workZone.x1"
          :y="layout.workZone.y"
          :width="layout.workZone.x2 - layout.workZone.x1"
          :height="layout.workZone.h"
          fill="none"
          stroke="#ca8a04"
          stroke-width="1"
        />
        <text
          :x="(layout.workZone.x1 + layout.workZone.x2) / 2"
          :y="layout.workZone.y + layout.workZone.h / 2 + 3"
          font-size="8"
          fill="#78350f"
          text-anchor="middle"
          font-family="'Noto Sans JP', sans-serif"
        >
          作業箇所
        </text>
      </g>

      <polygon
        v-if="taperPointsOffset(layout)"
        :points="taperPointsOffset(layout)!"
        fill="#fbbf24"
        opacity="0.85"
        stroke="#b45309"
        stroke-width="0.5"
      />
      <text
        v-if="layout.taperPoints && regulatedBand(layout)"
        :x="layout.taperLabelX"
        :y="regulatedBand(layout)!.y + regulatedBand(layout)!.h + 12"
        font-size="8"
        fill="#92400e"
        text-anchor="middle"
        font-family="'Noto Sans JP', sans-serif"
      >
        テーパー長 300m
      </text>

      <path
        v-if="layout.trafficRoute"
        :d="layout.trafficRoute.points"
        fill="none"
        stroke="#dc2626"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 路側帯 予告標識列 -->
      <g v-for="(item, i) in layout.shoulderSigns" :key="`sh-${i}`">
        <template v-if="item.sign.type === 'speed'">
          <circle :cx="item.x" :cy="item.y" r="10" fill="white" stroke="#1e40af" stroke-width="1.2" />
          <text :x="item.x" :y="item.y + 3" font-size="7" fill="#1e40af" text-anchor="middle" font-weight="600">
            {{ item.sign.label }}
          </text>
        </template>
        <template v-else-if="item.sign.type === 'work'">
          <rect :x="item.x - 10" :y="item.y - 8" width="20" height="16" fill="#f97316" rx="1" />
          <text :x="item.x" :y="item.y + 3" font-size="6" fill="white" text-anchor="middle">工</text>
        </template>
        <template v-else-if="item.sign.type === 'arrow'">
          <image
            v-if="iconSrc['arrow-board']"
            :href="iconSrc['arrow-board']"
            :x="item.x - 14"
            :y="item.y - 12"
            width="28"
            height="22"
            preserveAspectRatio="xMidYMid meet"
          />
        </template>
        <template v-else-if="item.sign.type === 'light'">
          <image
            v-if="iconSrc['warning-light']"
            :href="iconSrc['warning-light']"
            :x="item.x - 9"
            :y="item.y - 11"
            width="18"
            height="22"
            preserveAspectRatio="xMidYMid meet"
          />
        </template>
      </g>

      <template v-for="(icon, i) in layout.icons" :key="`icon-${i}`">
        <g v-if="icon.type === 'monitor'">
          <circle :cx="icon.x + icon.w / 2" :cy="icon.y + icon.h / 2" r="8" fill="#fbbf24" stroke="#92400e" stroke-width="1" />
          <text :x="icon.x + icon.w / 2" :y="icon.y + icon.h / 2 + 3" font-size="8" fill="#78350f" text-anchor="middle">監</text>
        </g>
        <image
          v-else-if="iconSrc[icon.type]"
          :href="iconSrc[icon.type]"
          :x="clampX(layout, icon.x, icon.w)"
          :y="icon.y"
          :width="icon.w"
          :height="icon.h"
          preserveAspectRatio="xMidYMid meet"
        />
      </template>

      <!-- ユーザー配置アイコン -->
      <rect
        class="hw-diagram-hit"
        :x="layout.diagramX"
        :y="layout.diagramTop"
        :width="layout.diagramW"
        :height="layout.diagramHeight"
        fill="transparent"
        @click="onDiagramBackgroundClick"
      />
      <g
        v-for="item in placedIconViews"
        :key="item.placementId"
        class="hw-placed-icon"
        :class="{
          'hw-placed-icon--selected': selectedPlacementId === item.placementId,
          'hw-placed-icon--dragging': draggingPlacementId === item.placementId,
        }"
        @mousedown="onPlacementMouseDown($event, item.placementId)"
      >
        <rect
          :x="item.x - 2"
          :y="item.y - 2"
          :width="item.w + 4"
          :height="item.h + 4"
          fill="none"
          :stroke="selectedPlacementId === item.placementId ? '#2563eb' : 'transparent'"
          stroke-width="1.5"
          rx="2"
        />
        <image
          :href="item.imageUrl"
          :x="item.x"
          :y="item.y"
          :width="item.w"
          :height="item.h"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>

      <!-- 距離スケール -->
      <g :transform="`translate(0, ${layout.diagramTop + layout.diagramHeight + 16})`">
        <line :x1="layout.diagramX" :y1="0" :x2="layout.diagramX + layout.diagramW" :y2="0" stroke="#6b7280" stroke-width="1" />
        <g v-for="(seg, i) in layout.distanceScale" :key="`dist-${i}`">
          <line :x1="seg.x" y1="-4" :x2="seg.x" y2="4" stroke="#6b7280" stroke-width="1" />
          <line :x1="seg.x + seg.w" y1="-4" :x2="seg.x + seg.w" y2="4" stroke="#6b7280" stroke-width="1" />
          <text :x="seg.x + seg.w / 2" y="14" font-size="7" fill="#4b5563" text-anchor="middle">{{ seg.label }}</text>
        </g>
        <text :x="layout.diagramX + layout.diagramW + 8" y="8" font-size="7" fill="#6b7280">300m</text>
        <text :x="layout.diagramX + layout.diagramW + 8" y="20" font-size="7" fill="#6b7280">1500m</text>
      </g>

      <!-- KP 相対スケール -->
      <g :transform="`translate(0, ${layout.diagramTop + layout.diagramHeight + 38})`">
        <g v-for="(tick, i) in layout.kpTicks" :key="`kpt-${i}`">
          <line :x1="tick.x" y1="-3" :x2="tick.x" y2="3" stroke="#94a3b8" stroke-width="0.8" />
          <text :x="tick.x" y="12" font-size="7" fill="#64748b" text-anchor="middle">{{ tick.offset }}</text>
        </g>
      </g>

      <g v-for="(label, i) in layout.kpLabels" :key="`kpl-${i}`">
        <line
          :x1="label.x"
          :y1="layout.diagramTop + layout.diagramHeight + 2"
          :x2="label.x"
          :y2="layout.diagramTop + layout.diagramHeight + 8"
          stroke="#475569"
          stroke-width="1"
        />
        <text :x="label.x" :y="layout.diagramTop + layout.diagramHeight + 54" font-size="8" fill="#1e293b" text-anchor="middle">
          KP{{ label.kp }}
        </text>
        <text :x="label.x" :y="layout.diagramTop + layout.diagramHeight + 64" font-size="7" fill="#64748b" text-anchor="middle">
          {{ label.kind }}
        </text>
      </g>
    </template>

    <template v-else>
      <text x="460" y="340" font-size="12" fill="#94a3b8" text-anchor="middle" font-family="'Noto Sans JP', sans-serif">
        走行/追越の4テンプレートで施工区間 KP を入力してください
      </text>
    </template>
  </svg>
</template>
