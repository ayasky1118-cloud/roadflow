import stopImg from '../assets/images/停止位置.svg'
import slowImg from '../assets/images/徐行.svg'
import cautionImg from '../assets/images/前方注意.svg'
import coneImg from '../assets/images/カラーコーン.svg'
import barricadeImg from '../assets/images/バリケード.svg'
import arrowImg from '../assets/images/右.svg'

/** 配置アイテム id → 画像 URL（docs/mock/src/assets/images） */
export const MAP_ITEM_IMAGE_BY_ID: Record<string, string> = {
  stop: stopImg,
  slow: slowImg,
  caution: cautionImg,
  cone: coneImg,
  barricade: barricadeImg,
  arrow: arrowImg,
}

export function getMapItemImageUrl(itemId: string): string | undefined {
  return MAP_ITEM_IMAGE_BY_ID[itemId]
}
