import type { HighwayTemplateKey } from '../data/highwayTemplates'
import type { RoadBandId } from './highwaySchematic'

/** Excel 模式図は KP 比例ではなく、テンプレート固定の距離レイアウト */
export interface FixedZone {
  x1: number
  x2: number
}

export interface ShoulderSign {
  rx: number
  type: 'speed' | 'work' | 'arrow' | 'light'
  label?: string
}

export interface DistanceSegment {
  x1: number
  x2: number
  label: string
}

export interface TemplateVisualSpec {
  upstreamSide: 'left' | 'right'
  workZone: FixedZone
  regulationZone: FixedZone
  taperZone: FixedZone
  trafficArrow: 'merge-down' | 'merge-up'
  shoulderSigns: ShoulderSign[]
  distanceScale: DistanceSegment[]
  kpOffsetTicks: number[]
  kpLabelSlots: { rx: number; kind: string }[]
  placements: {
    rx: number
    band: RoadBandId
    icon: 'cone' | 'sign-car' | 'arrow-board' | 'warning-light' | 'guard' | 'monitor'
  }[]
}

const UP_PASSING: TemplateVisualSpec = {
  upstreamSide: 'right',
  workZone: { x1: 0.06, x2: 0.20 },
  regulationZone: { x1: 0.04, x2: 0.96 },
  taperZone: { x1: 0.20, x2: 0.38 },
  trafficArrow: 'merge-down',
  shoulderSigns: [
    { rx: 0.88, type: 'speed', label: '80' },
    { rx: 0.80, type: 'speed', label: '60' },
    { rx: 0.72, type: 'work' },
    { rx: 0.64, type: 'arrow' },
    { rx: 0.56, type: 'arrow' },
    { rx: 0.48, type: 'arrow' },
    { rx: 0.40, type: 'light' },
    { rx: 0.32, type: 'arrow' },
  ],
  distanceScale: [
    { x1: 0.04, x2: 0.08, label: '50m' },
    { x1: 0.08, x2: 0.20, label: '300m' },
    { x1: 0.20, x2: 0.38, label: 'テーパー長' },
    { x1: 0.38, x2: 0.46, label: '100m' },
    { x1: 0.46, x2: 0.54, label: '200m' },
    { x1: 0.54, x2: 0.62, label: '100m' },
    { x1: 0.62, x2: 0.70, label: '100m' },
    { x1: 0.70, x2: 0.82, label: '200m' },
    { x1: 0.82, x2: 0.90, label: '500m' },
  ],
  kpOffsetTicks: [0.1, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.5],
  kpLabelSlots: [
    { rx: 0.08, kind: '施工起点' },
    { rx: 0.20, kind: '施工終点' },
    { rx: 0.04, kind: '規制起点' },
    { rx: 0.96, kind: '規制終点' },
  ],
  placements: [
    { rx: 0.10, band: 'passing', icon: 'guard' },
    { rx: 0.18, band: 'passing', icon: 'sign-car' },
    { rx: 0.12, band: 'passing', icon: 'monitor' },
    { rx: 0.14, band: 'passing', icon: 'monitor' },
    { rx: 0.16, band: 'passing', icon: 'cone' },
    { rx: 0.19, band: 'passing', icon: 'cone' },
    { rx: 0.28, band: 'passing', icon: 'cone' },
    { rx: 0.34, band: 'passing', icon: 'arrow-board' },
    { rx: 0.42, band: 'passing', icon: 'arrow-board' },
    { rx: 0.50, band: 'shoulder', icon: 'warning-light' },
    { rx: 0.30, band: 'driving', icon: 'arrow-board' },
  ],
}

function mirrorSpec(spec: TemplateVisualSpec): TemplateVisualSpec {
  const m = (rx: number) => 1 - rx
  const mz = (z: FixedZone) => ({ x1: m(z.x2), x2: m(z.x1) })
  return {
    upstreamSide: spec.upstreamSide === 'left' ? 'right' : 'left',
    workZone: mz(spec.workZone),
    regulationZone: mz(spec.regulationZone),
    taperZone: mz(spec.taperZone),
    trafficArrow: spec.trafficArrow === 'merge-down' ? 'merge-up' : 'merge-down',
    shoulderSigns: [...spec.shoulderSigns].reverse().map((s) => ({ ...s, rx: m(s.rx) })),
    distanceScale: [...spec.distanceScale].reverse().map((s) => ({
      x1: m(s.x2),
      x2: m(s.x1),
      label: s.label,
    })),
    kpOffsetTicks: spec.kpOffsetTicks.map((v) => -v),
    kpLabelSlots: spec.kpLabelSlots.map((s) => ({ ...s, rx: m(s.rx) })),
    placements: spec.placements.map((p) => ({ ...p, rx: m(p.rx) })),
  }
}

const UP_DRIVING: TemplateVisualSpec = {
  ...UP_PASSING,
  workZone: { x1: 0.06, x2: 0.22 },
  taperZone: { x1: 0.22, x2: 0.40 },
  placements: UP_PASSING.placements.map((p) =>
    p.band === 'passing'
      ? { ...p, band: 'driving' as RoadBandId }
      : p.band === 'driving'
        ? { ...p, band: 'passing' as RoadBandId }
        : p
  ),
}

export const TEMPLATE_VISUALS: Record<HighwayTemplateKey, TemplateVisualSpec> = {
  上り追越: UP_PASSING,
  下り追越: mirrorSpec(UP_PASSING),
  上り走行: UP_DRIVING,
  下り走行: mirrorSpec(UP_DRIVING),
}

export function rxToX(diagramX: number, diagramW: number, rx: number): number {
  return diagramX + rx * diagramW
}
