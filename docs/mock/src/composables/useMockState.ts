import { ref, reactive } from 'vue'
import {
  INITIAL_CUSTOMERS,
  DEFAULT_ORDER_NO,
  generateOrderNo,
  type Customer,
  type RegulationPattern,
  type RoadType,
  type OutputFormatType,
  HIGHWAY_BOM_ITEMS,
  MAP_ITEMS,
  type PlacementStandard,
  PLACEMENT_STANDARDS,
} from '../data/dummy'
import type { HighwayTemplateKey } from '../data/highwayTemplates'

export { PLACEMENT_STANDARDS }
export type { PlacementStandard }

export const roadType = ref<RoadType>('general')

export const customers = ref<Customer[]>([...INITIAL_CUSTOMERS])
export const selectedCustomer = ref<Customer | null>(null)

export const orderForm = reactive({
  orderNo: DEFAULT_ORDER_NO,
  orderDate: new Date().toISOString().slice(0, 10),
  manager: '',
  note: '',
})

export const siteForm = reactive({
  siteName: '',
  siteAddress: '',
  periodStart: '',
  periodEnd: '',
  workContent: '',
  regulationPattern: '' as RegulationPattern | '',
  regulationLength: '',
  timeOfDay: 'day' as 'day' | 'night',
})

export const bomCounts = reactive<Record<string, number>>(
  Object.fromEntries(MAP_ITEMS.map((item) => [item.id, 0]))
)

export interface PlacedMapItem {
  placementId: string
  itemId: string
  lng: number
  lat: number
}

export const placedMapItems = ref<PlacedMapItem[]>([])
export const selectedPlacedId = ref<string | null>(null)

function syncBomCounts() {
  const counts = Object.fromEntries(MAP_ITEMS.map((item) => [item.id, 0]))
  for (const p of placedMapItems.value) {
    counts[p.itemId] = (counts[p.itemId] ?? 0) + 1
  }
  for (const item of MAP_ITEMS) {
    bomCounts[item.id] = counts[item.id] ?? 0
  }
}

export function selectPlacedItem(placementId: string | null) {
  selectedPlacedId.value = placementId
}

export function placeItemOnMap(itemId: string, lng: number, lat: number) {
  const placement: PlacedMapItem = {
    placementId: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemId,
    lng,
    lat,
  }
  placedMapItems.value.push(placement)
  syncBomCounts()
  selectedPlacedId.value = placement.placementId
}

export function movePlacedItem(placementId: string, lng: number, lat: number) {
  const target = placedMapItems.value.find((p) => p.placementId === placementId)
  if (!target) return
  target.lng = lng
  target.lat = lat
}

export function removePlacedItem(placementId: string) {
  const index = placedMapItems.value.findIndex((p) => p.placementId === placementId)
  if (index < 0) return
  placedMapItems.value.splice(index, 1)
  syncBomCounts()
  if (selectedPlacedId.value === placementId) {
    selectedPlacedId.value = null
  }
}

export function getMapItemName(itemId: string): string {
  return MAP_ITEMS.find((i) => i.id === itemId)?.name ?? itemId
}

export function addCustomer(customer: Omit<Customer, 'id'>): Customer {
  const newCustomer: Customer = {
    id: `c-${Date.now()}`,
    ...customer,
  }
  customers.value = [newCustomer, ...customers.value]
  return newCustomer
}

export function resetOrderNo() {
  orderForm.orderNo = generateOrderNo()
}

// ─── 高速道路モジュール state ─────────────────────────────────

/** ユーザー入力のみ。テンプレートは xlsm データシート B列相当 */
export const highwayForm = reactive({
  template: '下り走行' as HighwayTemplateKey,
  regulationNo: '1',
  route: '中国自動車道',
  icFrom: '美祢',
  icTo: '美祢西',
  section: '1工区',
  constructionKpStart: '300.2',
  constructionKpEnd: '300.3',
  regulationTimeStart: '20:00',
  regulationTimeEnd: '06:00',
  timeOfDay: 'night' as 'day' | 'night',
  trafficNote: '',
  outputFormat: 'B' as OutputFormatType,
  useManualRegulation: false,
  manualRegulationKpStart: '',
  manualRegulationKpEnd: '',
})

export interface HighwayBomRow {
  id: string
  name: string
  spec: string
  qty: number
  unit: string
  procurement: 'owner' | 'contractor'
}

export const highwayBomRows = ref<HighwayBomRow[]>(
  HIGHWAY_BOM_ITEMS.map((item) => ({
    id: item.id,
    name: item.name,
    spec: item.spec,
    qty: item.defaultQty,
    unit: item.unit,
    procurement: item.procurement,
  }))
)
