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
import type { HighwayLegendIconType } from '../data/highwayLegendImages'
import { LEGEND_ICON_TO_BOM_ID } from '../data/highwayLegendImages'

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

const LEGEND_BOM_IDS = new Set(
  Object.values(LEGEND_ICON_TO_BOM_ID).filter((id): id is string => Boolean(id))
)

export interface PlacedSchematicItem {
  placementId: string
  icon: HighwayLegendIconType
  x: number
  y: number
}

export const placedSchematicItems = ref<PlacedSchematicItem[]>([])
export const selectedSchematicPlacementId = ref<string | null>(null)

function syncHighwayBomFromPlacements() {
  const counts = Object.fromEntries([...LEGEND_BOM_IDS].map((id) => [id, 0]))
  for (const placement of placedSchematicItems.value) {
    const bomId = LEGEND_ICON_TO_BOM_ID[placement.icon]
    if (bomId) counts[bomId] = (counts[bomId] ?? 0) + 1
  }
  for (const row of highwayBomRows.value) {
    if (LEGEND_BOM_IDS.has(row.id)) {
      row.qty = counts[row.id] ?? 0
    }
  }
}

export function selectSchematicPlacement(placementId: string | null) {
  selectedSchematicPlacementId.value = placementId
}

export function placeSchematicIcon(icon: HighwayLegendIconType, x: number, y: number) {
  const placement: PlacedSchematicItem = {
    placementId: `hw-pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    icon,
    x,
    y,
  }
  placedSchematicItems.value.push(placement)
  syncHighwayBomFromPlacements()
  selectedSchematicPlacementId.value = placement.placementId
  return placement
}

export function moveSchematicPlacement(placementId: string, x: number, y: number) {
  const target = placedSchematicItems.value.find((p) => p.placementId === placementId)
  if (!target) return
  target.x = x
  target.y = y
}

export function removeSchematicPlacement(placementId: string) {
  const index = placedSchematicItems.value.findIndex((p) => p.placementId === placementId)
  if (index < 0) return
  placedSchematicItems.value.splice(index, 1)
  syncHighwayBomFromPlacements()
  if (selectedSchematicPlacementId.value === placementId) {
    selectedSchematicPlacementId.value = null
  }
}

export function countSchematicPlacements(icon: HighwayLegendIconType): number {
  return placedSchematicItems.value.filter((p) => p.icon === icon).length
}
