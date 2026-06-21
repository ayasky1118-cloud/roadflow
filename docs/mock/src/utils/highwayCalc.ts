/** xlsm「高速規制図半自動作成ソフト」VBAロジックの移植（仕様書 §3.3 / §7.1） */

export interface RegulationMargin {
  /** 手前マージン km（既定 0.7） */
  near: number
  /** 奥マージン km（既定 0.3） */
  far: number
}

export const DEFAULT_REGULATION_MARGIN: RegulationMargin = { near: 0.7, far: 0.3 }

export const HIGHWAY_TEMPLATE_NAMES = ['上り追越', '上り走行', '下り追越', '下り走行'] as const
export type HighwayTemplateName = (typeof HIGHWAY_TEMPLATE_NAMES)[number]

export function isSupportedTemplate(template: string): template is HighwayTemplateName {
  return (HIGHWAY_TEMPLATE_NAMES as readonly string[]).includes(template)
}

/** Excel RoundUp（0 から離れる方向） */
export function roundUp(value: number, decimals: number): number {
  const factor = 10 ** decimals
  const scaled = value * factor
  if (scaled >= 0) return Math.ceil(scaled - 1e-9) / factor
  return Math.floor(scaled + 1e-9) / factor
}

/** Excel RoundDown（0 に近づく方向） */
export function roundDown(value: number, decimals: number): number {
  const factor = 10 ** decimals
  const scaled = value * factor
  if (scaled >= 0) return Math.floor(scaled + 1e-9) / factor
  return Math.ceil(scaled - 1e-9) / factor
}

export function getTemplateName(
  direction: 'up' | 'down',
  laneType: string
): HighwayTemplateName | null {
  if (laneType !== '走行' && laneType !== '追越') return null
  return `${direction === 'up' ? '上り' : '下り'}${laneType}` as HighwayTemplateName
}

export function parseKp(value: string): number | null {
  const n = parseFloat(value.trim())
  return Number.isFinite(n) ? n : null
}

export function formatKp(value: number): string {
  return value.toFixed(1)
}

export interface RegulationCalcResult {
  template: HighwayTemplateName | null
  supported: boolean
  /** BD8: 施工区間延長 m */
  constructionLengthM: number
  /** AL10: 規制区間起点 KP */
  regulationKpStart: number
  /** AW10: 規制区間終点 KP */
  regulationKpEnd: number
  /** BD10: 規制区間延長 m */
  regulationLengthM: number
}

/**
 * 施工区間 KP（AL8/AW8）から規制区間 KP・延長を算出する。
 * テンプレートが走行/追越の上下4種以外の場合は supported=false。
 */
export function calcRegulation(
  template: string,
  constructionKpStart: number,
  constructionKpEnd: number,
  margin: RegulationMargin = DEFAULT_REGULATION_MARGIN
): RegulationCalcResult {
  if (!isSupportedTemplate(template)) {
    return {
      template: null,
      supported: false,
      constructionLengthM: 0,
      regulationKpStart: constructionKpStart,
      regulationKpEnd: constructionKpEnd,
      regulationLengthM: 0,
    }
  }

  const isUp = template.startsWith('上り')

  const constructionLengthM =
    (isUp ? constructionKpStart - constructionKpEnd : constructionKpEnd - constructionKpStart) *
    1000

  const regulationKpStart = isUp
    ? roundUp(constructionKpStart + margin.near, 1)
    : roundDown(constructionKpStart - margin.near, 1)

  const regulationKpEnd = isUp
    ? roundDown(constructionKpEnd - margin.far, 1)
    : roundUp(constructionKpEnd + margin.far, 1)

  const regulationLengthM =
    (isUp ? regulationKpStart - regulationKpEnd : regulationKpEnd - regulationKpStart) * 1000

  return {
    template,
    supported: true,
    constructionLengthM: Math.round(constructionLengthM * 10) / 10,
    regulationKpStart,
    regulationKpEnd,
    regulationLengthM: Math.round(regulationLengthM * 10) / 10,
  }
}
