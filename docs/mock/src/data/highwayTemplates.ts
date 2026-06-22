import type { HighwayTemplateName } from '../utils/highwayCalc'
import type { RoadBandId } from '../utils/highwaySchematic'
import type { HighwayLegendIconType } from './highwayLegendImages'

export type HighwayTemplateKey = HighwayTemplateName

export type HighwayIconType =
  | 'cone'
  | 'sign-car'
  | 'arrow-board'
  | 'warning-light'
  | 'traffic-route'
  | 'cushion'
  | 'guard'
  | 'advance-sign'

/** xlsm 凡例（全4シート共通・63〜68行相当） */
export interface HighwayLegendItem {
  label: string
  icon: HighwayLegendIconType
}

export const HIGHWAY_LEGEND_ITEMS: HighwayLegendItem[] = [
  { label: '交通監視員・工事用要員', icon: 'monitor' },
  { label: '標識車（車載式標識有り）', icon: 'sign-car' },
  { label: '物理的防護装置', icon: 'guard' },
  { label: 'ラバーコーン', icon: 'cone' },
  { label: '回転灯（ＡＶライト等）', icon: 'warning-light' },
  { label: '矢印板', icon: 'arrow-board' },
]

/** テンプレート固有の固定アイコン配置（drawing XML から抽出・diagram 内 row<48） */
export interface TemplateIconAnchor {
  icon: HighwayIconType
  /** diagram 幅に対する比率 0〜1 */
  rx: number
  band: RoadBandId
  /** 車線帯内の縦位置 0〜1 */
  ry: number
  w: number
  h: number
}

export interface HighwayTemplateDef {
  key: HighwayTemplateKey
  direction: 'up' | 'down'
  laneType: '走行' | '追越'
  regulatedBandId: RoadBandId
  alternateBandId: RoadBandId
  directionLabel: string
  /** 追越系( drawing1/2 ) と 走行系( drawing3/4 ) で配置が異なる */
  family: 'passing' | 'driving'
  staticIcons: TemplateIconAnchor[]
}

/** 追越車線規制テンプレート（上り追越・下り追越共通レイアウト） */
const PASSING_STATIC_ICONS: TemplateIconAnchor[] = [
  { icon: 'arrow-board', rx: 0.21, band: 'passing', ry: 0.35, w: 36, h: 30 },
  { icon: 'arrow-board', rx: 0.38, band: 'passing', ry: 0.25, w: 36, h: 30 },
  { icon: 'warning-light', rx: 0.36, band: 'passing', ry: 0.4, w: 18, h: 22 },
  { icon: 'cone', rx: 0.53, band: 'passing', ry: 0.55, w: 16, h: 22 },
  { icon: 'cone', rx: 0.56, band: 'passing', ry: 0.55, w: 16, h: 22 },
  { icon: 'cone', rx: 0.59, band: 'passing', ry: 0.55, w: 16, h: 22 },
  { icon: 'traffic-route', rx: 0.78, band: 'driving', ry: 0.45, w: 28, h: 18 },
  { icon: 'warning-light', rx: 0.81, band: 'driving', ry: 0.45, w: 18, h: 22 },
  { icon: 'sign-car', rx: 0.15, band: 'passing', ry: 0.3, w: 32, h: 22 },
  { icon: 'guard', rx: 0.62, band: 'passing', ry: 0.35, w: 28, h: 16 },
]

/** 走行車線規制テンプレート（上り走行・下り走行共通レイアウト） */
const DRIVING_STATIC_ICONS: TemplateIconAnchor[] = [
  { icon: 'traffic-route', rx: 0.43, band: 'driving', ry: 0.3, w: 28, h: 18 },
  { icon: 'arrow-board', rx: 0.20, band: 'driving', ry: 0.45, w: 36, h: 30 },
  { icon: 'advance-sign', rx: 0.29, band: 'driving', ry: 0.45, w: 28, h: 18 },
  { icon: 'arrow-board', rx: 0.36, band: 'driving', ry: 0.45, w: 36, h: 30 },
  { icon: 'warning-light', rx: 0.35, band: 'driving', ry: 0.5, w: 18, h: 22 },
  { icon: 'cone', rx: 0.53, band: 'driving', ry: 0.55, w: 16, h: 22 },
  { icon: 'cone', rx: 0.56, band: 'driving', ry: 0.55, w: 16, h: 22 },
  { icon: 'traffic-route', rx: 0.63, band: 'passing', ry: 0.45, w: 28, h: 18 },
  { icon: 'sign-car', rx: 0.12, band: 'driving', ry: 0.35, w: 32, h: 22 },
  { icon: 'cushion', rx: 0.48, band: 'driving', ry: 0.35, w: 20, h: 20 },
  { icon: 'guard', rx: 0.58, band: 'driving', ry: 0.3, w: 28, h: 16 },
]

export const HIGHWAY_TEMPLATES: Record<HighwayTemplateKey, HighwayTemplateDef> = {
  上り追越: {
    key: '上り追越',
    direction: 'up',
    laneType: '追越',
    regulatedBandId: 'passing',
    alternateBandId: 'driving',
    directionLabel: '上り',
    family: 'passing',
    staticIcons: PASSING_STATIC_ICONS,
  },
  下り追越: {
    key: '下り追越',
    direction: 'down',
    laneType: '追越',
    regulatedBandId: 'passing',
    alternateBandId: 'driving',
    directionLabel: '下り',
    family: 'passing',
    staticIcons: PASSING_STATIC_ICONS,
  },
  上り走行: {
    key: '上り走行',
    direction: 'up',
    laneType: '走行',
    regulatedBandId: 'driving',
    alternateBandId: 'passing',
    directionLabel: '上り',
    family: 'driving',
    staticIcons: DRIVING_STATIC_ICONS,
  },
  下り走行: {
    key: '下り走行',
    direction: 'down',
    laneType: '走行',
    regulatedBandId: 'driving',
    alternateBandId: 'passing',
    directionLabel: '下り',
    family: 'driving',
    staticIcons: DRIVING_STATIC_ICONS,
  },
}

export const HIGHWAY_TEMPLATE_KEYS: HighwayTemplateKey[] = [
  '上り追越',
  '下り追越',
  '上り走行',
  '下り走行',
]

export function getHighwayTemplate(key: HighwayTemplateKey | null): HighwayTemplateDef | null {
  if (!key) return null
  return HIGHWAY_TEMPLATES[key] ?? null
}

/** 下り線テンプレートは模式図を左右反転（Excel 各シートの向きに合わせる） */
export function mirrorRx(rx: number, direction: 'up' | 'down'): number {
  return direction === 'down' ? 1 - rx : rx
}
