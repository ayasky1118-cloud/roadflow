export interface Customer {
  id: string
  companyName: string
  contactName: string
  phone: string
  email?: string
  address?: string
}

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    companyName: '株式会社山田建設',
    contactName: '山田太郎',
    phone: '06-1234-5678',
  },
  {
    id: 'c2',
    companyName: '大阪土木工業株式会社',
    contactName: '鈴木一郎',
    phone: '06-2345-6789',
  },
  {
    id: 'c3',
    companyName: '関西道路サービス株式会社',
    contactName: '田中次郎',
    phone: '072-345-6789',
  },
  {
    id: 'c4',
    companyName: '株式会社西日本警備',
    contactName: '佐藤花子',
    phone: '06-3456-7890',
  },
  {
    id: 'c5',
    companyName: '近畿建設株式会社',
    contactName: '高橋三郎',
    phone: '06-4567-8901',
  },
]

export const DEFAULT_ORDER_NO = 'RF-2026-0001'

export type RegulationPattern = 'alternate' | 'full_stop' | 'lane'

export const REGULATION_PATTERN_OPTIONS: {
  value: RegulationPattern
  label: string
}[] = [
  { value: 'alternate', label: '片側交互通行' },
  { value: 'full_stop', label: '全面通行止め' },
  { value: 'lane', label: '車線規制' },
]

export interface MapItem {
  id: string
  category: 'sign' | 'equipment'
  groupLabel: string
  name: string
}

export const MAP_ITEMS: MapItem[] = [
  { id: 'stop', category: 'sign', groupLabel: '標識', name: '停止位置' },
  { id: 'slow', category: 'sign', groupLabel: '標識', name: '徐行' },
  { id: 'caution', category: 'sign', groupLabel: '標識', name: '前方注意' },
  { id: 'cone', category: 'equipment', groupLabel: '資機材', name: 'カラーコーン' },
  { id: 'barricade', category: 'equipment', groupLabel: '資機材', name: 'バリケード' },
  { id: 'arrow', category: 'equipment', groupLabel: '資機材', name: '矢印板' },
]

export function generateOrderNo(): string {
  const n = Math.floor(Math.random() * 9000) + 1000
  return `RF-2026-${String(n).padStart(4, '0')}`
}

// ─── 高速道路モジュール ───────────────────────────────────────

export type RoadType = 'general' | 'highway'

export type HighwayDirection = 'up' | 'down' | 'both'
export const HIGHWAY_DIRECTION_OPTIONS: { value: HighwayDirection; label: string }[] = [
  { value: 'up', label: '上り線' },
  { value: 'down', label: '下り線' },
  { value: 'both', label: '上下線' },
]

export type HighwayRegulationType =
  | 'driving'
  | 'passing'
  | 'climbing'
  | 'off_ramp'
  | 'on_ramp'
  | 'shoulder'
  | 'ic_close'
export const HIGHWAY_REGULATION_TYPE_OPTIONS: {
  value: HighwayRegulationType
  label: string
}[] = [
  { value: 'driving', label: '走行車線規制' },
  { value: 'passing', label: '追越車線規制' },
  { value: 'climbing', label: '登坂車線規制' },
  { value: 'off_ramp', label: 'OFFランプ規制' },
  { value: 'on_ramp', label: 'ONランプ規制' },
  { value: 'shoulder', label: '路肩規制' },
  { value: 'ic_close', label: 'IC封鎖' },
]

export type OutputFormatType = 'A' | 'B'
export const OUTPUT_FORMAT_OPTIONS: { value: OutputFormatType; label: string; desc: string }[] = [
  { value: 'A', label: '系統A（規制番号管理型）', desc: '大規模工事・番号別シート管理' },
  { value: 'B', label: '系統B（規制種別網羅型）', desc: '中小規模工事・数量表一体型' },
]

export const HIGHWAY_ROUTE_OPTIONS = [
  '中国自動車道',
  '山陽自動車道',
  '名神高速道路',
  '東名高速道路',
  '新東名高速道路',
  '東北自動車道',
  '関越自動車道',
  '北陸自動車道',
]

export const IC_OPTIONS = [
  '美祢',
  '美祢西',
  '玖珂IC',
  '大竹IC',
  '廿日市IC',
  '広島IC',
  '西条IC',
  '尾道IC',
  '福山東IC',
  '笠岡IC',
]

export type ProcurementCategory = 'owner' | 'contractor'

export interface HighwayBomItem {
  id: string
  name: string
  spec: string
  defaultQty: number
  unit: string
  procurement: ProcurementCategory
}

/** 標準資機材辞書（標準化要件定義書 §6.1 準拠） */
export const HIGHWAY_BOM_ITEMS: HighwayBomItem[] = [
  { id: 'sign_board', name: '標識', spec: '規制標識一式', defaultQty: 8, unit: '枚', procurement: 'owner' },
  { id: 'sign_car', name: '車載式標識', spec: '2t車用', defaultQty: 1, unit: '台', procurement: 'owner' },
  { id: 'physical_guard', name: '物理的防護装置', spec: '作業箇所防護用', defaultQty: 1, unit: '式', procurement: 'owner' },
  { id: 'monitor', name: '交通監視員', spec: '有資格者', defaultQty: 4, unit: '名', procurement: 'contractor' },
  { id: 'robot', name: 'ロボット誘導員', spec: '自動誘導機', defaultQty: 1, unit: '基', procurement: 'owner' },
  { id: 'cone', name: 'ジャンボコーン', spec: 'H700mm', defaultQty: 1, unit: '式', procurement: 'owner' },
  { id: 'arrow_board', name: '矢印板', spec: '電光式', defaultQty: 1, unit: '式', procurement: 'owner' },
  { id: 'load_car', name: '積載車', spec: '2t車', defaultQty: 1, unit: '台', procurement: 'contractor' },
  { id: 'rotating_light', name: '回転灯', spec: 'AVライト等', defaultQty: 1, unit: '基', procurement: 'owner' },
  { id: 'cushion_drum', name: 'クッションドラム', spec: '緩衝型', defaultQty: 4, unit: '基', procurement: 'owner' },
]

/** 標準配置基準マスタ（外部管理想定・標準化要件定義書 §5.3） */
export interface PlacementStandard {
  label: string
  value: string
  note: string
}
export const PLACEMENT_STANDARDS: PlacementStandard[] = [
  { label: '予告標識距離', value: '300m / 500m / 1000m', note: '規制種別に応じて段階配置' },
  { label: 'テーパー長', value: '車線数・規制速度・交通量から算出', note: 'マスタ値で自動計算・手動上書き可' },
  { label: 'コーン間隔', value: '20〜30m（標準値）', note: '所轄警察署協議値で上書き' },
  { label: 'KP精度', value: '小数第1位（例: 332.4）', note: '表示・丸めルールを統一' },
  { label: '規制マージン（手前）', value: '0.7 km', note: 'xlsm VBA 既定値・路線別マスタ化予定' },
  { label: '規制マージン（奥）', value: '0.3 km', note: 'xlsm VBA 既定値・路線別マスタ化予定' },
]
