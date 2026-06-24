import type { HighwayTemplateName } from './highwayCalc'
import { formatKp } from './highwayCalc'
import { getHighwayTemplate, type HighwayIconType } from '../data/highwayTemplates'
import {
  TEMPLATE_VISUALS,
  rxToX,
  type ShoulderSign,
  type TemplateVisualSpec,
} from './highwayTemplateVisuals'

export const SCHEMATIC_W = 920
export const SCHEMATIC_H = 400
const DIAGRAM_X = 118
const DIAGRAM_W = 740
const DIAGRAM_TOP = 136

export const ROAD_BANDS = [
  { id: 'median', label: '中央分離帯', h: 34, fill: '#e8e8e8', stroke: '#999' },
  { id: 'passing', label: '追越車線', h: 50, fill: '#ffffff', stroke: '#999' },
  { id: 'driving', label: '走行車線', h: 50, fill: '#ffffff', stroke: '#999' },
  { id: 'shoulder', label: '路側帯', h: 34, fill: '#f5f5f5', stroke: '#ccc' },
] as const

export type RoadBandId = (typeof ROAD_BANDS)[number]['id']

export interface SchematicInput {
  template: HighwayTemplateName | null
  constructionKpStart: number | null
  constructionKpEnd: number | null
  regulationKpStart: number | null
  regulationKpEnd: number | null
}

export interface SchematicBandLayout {
  id: RoadBandId
  label: string
  y: number
  h: number
  fill: string
  stroke: string
  isRegulated: boolean
}

export interface SchematicIcon {
  type: HighwayIconType | 'monitor'
  x: number
  y: number
  w: number
  h: number
}

export interface SchematicLayout {
  ready: boolean
  templateKey: HighwayTemplateName | null
  templateFamily: 'passing' | 'driving' | null
  direction: 'up' | 'down'
  regulatedBandId: RoadBandId
  diagramX: number
  diagramW: number
  diagramTop: number
  diagramHeight: number
  bands: SchematicBandLayout[]
  visual: TemplateVisualSpec | null
  workZone: { x1: number; x2: number; y: number; h: number } | null
  regulationZone: { x1: number; x2: number } | null
  taperPoints: string | null
  taperLabelX: number
  trafficRoute: { points: string } | null
  shoulderSigns: { x: number; y: number; sign: ShoulderSign }[]
  distanceScale: { x: number; w: number; label: string }[]
  kpTicks: { x: number; offset: string }[]
  kpLabels: { x: number; kp: string; kind: string }[]
  icons: SchematicIcon[]
  upstreamLabel: string
  downstreamLabel: string
}

function bandRect(bands: SchematicBandLayout[], bandId: RoadBandId) {
  const b = bands.find((x) => x.id === bandId)
  return b ? { y: b.y, h: b.h } : { y: DIAGRAM_TOP, h: 50 }
}

function zonePx(z: { x1: number; x2: number }, diagramX: number, diagramW: number) {
  return { x1: rxToX(diagramX, diagramW, z.x1), x2: rxToX(diagramX, diagramW, z.x2) }
}

function buildTaper(
  visual: TemplateVisualSpec,
  regBand: { y: number; h: number },
  diagramX: number,
  diagramW: number
): { points: string; labelX: number } {
  const t = zonePx(visual.taperZone, diagramX, diagramW)
  const work = zonePx(visual.workZone, diagramX, diagramW)
  const yTop = regBand.y
  const yBot = regBand.y + regBand.h

  if (visual.upstreamSide === 'right') {
    const xWorkEnd = work.x2
    const xTaperEnd = t.x2
    return {
      points: `${xWorkEnd},${yBot} ${xTaperEnd},${yTop} ${xTaperEnd},${yBot}`,
      labelX: (xWorkEnd + xTaperEnd) / 2,
    }
  }
  const xWorkStart = work.x1
  const xTaperStart = t.x1
  return {
    points: `${xWorkStart},${yBot} ${xTaperStart},${yTop} ${xTaperStart},${yBot}`,
    labelX: (xWorkStart + xTaperStart) / 2,
  }
}

function buildTrafficArrow(
  visual: TemplateVisualSpec,
  regBand: { y: number; h: number },
  altBand: { y: number; h: number },
  diagramX: number,
  diagramW: number
): string {
  const t = zonePx(visual.taperZone, diagramX, diagramW)
  const midTaper = (t.x1 + t.x2) / 2
  const fromY = regBand.y + regBand.h * 0.5
  const toY = altBand.y + altBand.h * 0.5
  if (visual.trafficArrow === 'merge-down') {
    return `M ${midTaper - 40} ${fromY} Q ${midTaper} ${(fromY + toY) / 2} ${midTaper - 20} ${toY} M ${midTaper - 28} ${toY - 6} L ${midTaper - 20} ${toY} L ${midTaper - 12} ${toY - 6}`
  }
  return `M ${midTaper + 40} ${fromY} Q ${midTaper} ${(fromY + toY) / 2} ${midTaper + 20} ${toY} M ${midTaper + 12} ${toY - 6} L ${midTaper + 20} ${toY} L ${midTaper + 28} ${toY - 6}`
}

const EMPTY: SchematicLayout = {
  ready: false,
  templateKey: null,
  templateFamily: null,
  direction: 'down',
  regulatedBandId: 'driving',
  diagramX: DIAGRAM_X,
  diagramW: DIAGRAM_W,
  diagramTop: DIAGRAM_TOP,
  diagramHeight: ROAD_BANDS.reduce((s, b) => s + b.h, 0),
  bands: [],
  visual: null,
  workZone: null,
  regulationZone: null,
  taperPoints: null,
  taperLabelX: 0,
  trafficRoute: null,
  shoulderSigns: [],
  distanceScale: [],
  kpTicks: [],
  kpLabels: [],
  icons: [],
  upstreamLabel: '',
  downstreamLabel: '',
}

export function buildSchematicLayout(input: SchematicInput): SchematicLayout {
  const { template, constructionKpStart, constructionKpEnd, regulationKpStart, regulationKpEnd } =
    input

  const tpl = getHighwayTemplate(template)
  const visual = template ? TEMPLATE_VISUALS[template] : null

  if (
    !tpl ||
    !visual ||
    constructionKpStart === null ||
    constructionKpEnd === null ||
    regulationKpStart === null ||
    regulationKpEnd === null
  ) {
    return { ...EMPTY }
  }

  const diagramHeight = ROAD_BANDS.reduce((s, b) => s + b.h, 0)
  let y = DIAGRAM_TOP
  const bands: SchematicBandLayout[] = ROAD_BANDS.map((b) => {
    const band = {
      id: b.id,
      label: b.label,
      y,
      h: b.h,
      fill: b.fill,
      stroke: b.stroke,
      isRegulated: b.id === tpl.regulatedBandId,
    }
    y += b.h
    return band
  })

  const regBand = bandRect(bands, tpl.regulatedBandId)
  const altBand = bandRect(bands, tpl.alternateBandId)
  const shoulderBand = bandRect(bands, 'shoulder')

  const workPx = zonePx(visual.workZone, DIAGRAM_X, DIAGRAM_W)
  const regPx = zonePx(visual.regulationZone, DIAGRAM_X, DIAGRAM_W)
  const taper = buildTaper(visual, regBand, DIAGRAM_X, DIAGRAM_W)

  const icons: SchematicIcon[] = visual.placements.map((p) => {
    const band = bandRect(bands, p.band)
    const sizes: Record<string, [number, number]> = {
      cone: [14, 20],
      'sign-car': [32, 22],
      'arrow-board': [34, 28],
      'warning-light': [18, 22],
      guard: [28, 16],
      monitor: [16, 20],
    }
    const [w, h] = sizes[p.icon] ?? [20, 20]
    return {
      type: p.icon,
      x: rxToX(DIAGRAM_X, DIAGRAM_W, p.rx) - w / 2,
      y: band.y + (band.h - h) / 2,
      w,
      h,
    }
  })

  const shoulderSigns = visual.shoulderSigns.map((sign) => ({
    x: rxToX(DIAGRAM_X, DIAGRAM_W, sign.rx),
    y: shoulderBand.y + shoulderBand.h / 2,
    sign,
  }))

  const distanceScale = visual.distanceScale.map((s) => ({
    x: rxToX(DIAGRAM_X, DIAGRAM_W, s.x1),
    w: (s.x2 - s.x1) * DIAGRAM_W,
    label: s.label,
  }))

  const kpTicks = visual.kpOffsetTicks.map((off, i) => ({
    x: rxToX(DIAGRAM_X, DIAGRAM_W, 0.04 + (i / (visual.kpOffsetTicks.length - 1)) * 0.92),
    offset: off > 0 ? `+${off.toFixed(1)}` : off.toFixed(1),
  }))

  const kpValues = [
    { kp: formatKp(constructionKpStart), kind: '施工起点' },
    { kp: formatKp(constructionKpEnd), kind: '施工終点' },
    { kp: formatKp(regulationKpStart), kind: '規制起点' },
    { kp: formatKp(regulationKpEnd), kind: '規制終点' },
  ]
  const kpLabels = visual.kpLabelSlots.map((slot, i) => ({
    x: rxToX(DIAGRAM_X, DIAGRAM_W, slot.rx),
    kp: kpValues[i]?.kp ?? '—',
    kind: slot.kind,
  }))

  return {
    ready: true,
    templateKey: tpl.key,
    templateFamily: tpl.family,
    direction: tpl.direction,
    regulatedBandId: tpl.regulatedBandId,
    diagramX: DIAGRAM_X,
    diagramW: DIAGRAM_W,
    diagramTop: DIAGRAM_TOP,
    diagramHeight,
    bands,
    visual,
    workZone: { ...workPx, y: regBand.y, h: regBand.h },
    regulationZone: regPx,
    taperPoints: taper.points,
    taperLabelX: taper.labelX,
    trafficRoute: { points: buildTrafficArrow(visual, regBand, altBand, DIAGRAM_X, DIAGRAM_W) },
    shoulderSigns,
    distanceScale,
    kpTicks,
    kpLabels,
    icons,
    upstreamLabel: visual.upstreamSide === 'right' ? '← 上流' : '上流 →',
    downstreamLabel: visual.upstreamSide === 'right' ? '下流 →' : '← 下流',
  }
}
