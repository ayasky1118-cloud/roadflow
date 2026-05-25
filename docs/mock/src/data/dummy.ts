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
  icon: string
}

export const MAP_ITEMS: MapItem[] = [
  { id: 'stop', category: 'sign', groupLabel: '標識', name: '停止位置', icon: '🛑' },
  { id: 'slow', category: 'sign', groupLabel: '標識', name: '徐行', icon: '⚠️' },
  { id: 'caution', category: 'sign', groupLabel: '標識', name: '前方注意', icon: '🪧' },
  { id: 'cone', category: 'equipment', groupLabel: '資機材', name: 'カラーコーン', icon: '🔶' },
  { id: 'barricade', category: 'equipment', groupLabel: '資機材', name: 'バリケード', icon: '🚧' },
  { id: 'arrow', category: 'equipment', groupLabel: '資機材', name: '矢印板', icon: '➡️' },
]

export function generateOrderNo(): string {
  const n = Math.floor(Math.random() * 9000) + 1000
  return `RF-2026-${String(n).padStart(4, '0')}`
}
