import legendMonitorImg from '../assets/images/highway/legend/legend-monitor.png'
import legendSignCarImg from '../assets/images/highway/legend/legend-sign-car.png'
import legendGuardImg from '../assets/images/highway/legend/legend-guard.png'
import legendConeImg from '../assets/images/highway/legend/legend-cone.png'
import legendWarningLightImg from '../assets/images/highway/legend/legend-warning-light.png'
import legendArrowBoardImg from '../assets/images/highway/legend/legend-arrow-board.png'

export type HighwayLegendIconType =
  | 'monitor'
  | 'sign-car'
  | 'guard'
  | 'cone'
  | 'warning-light'
  | 'arrow-board'

export const HIGHWAY_LEGEND_IMAGE_SRC: Partial<Record<HighwayLegendIconType, string>> = {
  monitor: legendMonitorImg,
  'sign-car': legendSignCarImg,
  guard: legendGuardImg,
  cone: legendConeImg,
  'warning-light': legendWarningLightImg,
  'arrow-board': legendArrowBoardImg,
}

export const HIGHWAY_PLACED_ICON_SIZES: Record<HighwayLegendIconType, [number, number]> = {
  monitor: [20, 24],
  'sign-car': [32, 22],
  guard: [28, 20],
  cone: [16, 22],
  'warning-light': [20, 24],
  'arrow-board': [32, 26],
}

/** 凡例アイコン → 資機材数量表の品目 ID */
export const LEGEND_ICON_TO_BOM_ID: Partial<Record<HighwayLegendIconType, string>> = {
  monitor: 'monitor',
  'sign-car': 'sign_car',
  guard: 'physical_guard',
  cone: 'cone',
  'warning-light': 'rotating_light',
  'arrow-board': 'arrow_board',
}

export function getHighwayLegendImageUrl(icon: HighwayLegendIconType): string | undefined {
  return HIGHWAY_LEGEND_IMAGE_SRC[icon]
}

export function getHighwayPlacedIconSize(icon: HighwayLegendIconType): [number, number] {
  return HIGHWAY_PLACED_ICON_SIZES[icon] ?? [24, 20]
}
