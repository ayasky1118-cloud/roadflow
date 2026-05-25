import { ref, reactive } from 'vue'
import {
  INITIAL_CUSTOMERS,
  DEFAULT_ORDER_NO,
  generateOrderNo,
  type Customer,
  type RegulationPattern,
  MAP_ITEMS,
} from '../data/dummy'

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
