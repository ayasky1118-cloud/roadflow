<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Customer } from '../data/dummy'
import { customers, addCustomer } from '../composables/useMockState'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [customer: Customer]
}>()

const view = ref<'list' | 'form'>('list')
const searchQuery = ref('')

const form = ref({
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
})

const formErrors = ref<Record<string, string>>({})

const filteredCustomers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return customers.value
  return customers.value.filter(
    (c) =>
      c.companyName.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q) ||
      c.phone.includes(q)
  )
})

function close() {
  emit('update:modelValue', false)
  view.value = 'list'
  searchQuery.value = ''
  resetForm()
}

function onSelect(c: Customer) {
  emit('select', c)
  close()
}

function showAddForm() {
  view.value = 'form'
  resetForm()
}

function backToList() {
  view.value = 'list'
  resetForm()
}

function resetForm() {
  form.value = {
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
  }
  formErrors.value = {}
}

function validateForm(): boolean {
  const errors: Record<string, string> = {}
  if (!form.value.companyName.trim()) errors.companyName = '会社名を入力してください'
  if (!form.value.contactName.trim()) errors.contactName = '担当者名を入力してください'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

function registerAndSelect() {
  if (!validateForm()) return
  const newCustomer = addCustomer({
    companyName: form.value.companyName.trim(),
    contactName: form.value.contactName.trim(),
    phone: form.value.phone.trim(),
    email: form.value.email.trim() || undefined,
    address: form.value.address.trim() || undefined,
  })
  emit('select', newCustomer)
  close()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-show="modelValue"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customerSelectModalTitle"
    >
      <div class="modal-overlay" @click="close"></div>
      <div class="modal-dialog" @click="close">
        <div class="modal-content select-modal" @click.stop>
          <div class="modal-header">
            <h3 id="customerSelectModalTitle" class="modal-header-title">
              {{ view === 'list' ? '顧客を選択' : '顧客を新規登録' }}
            </h3>
            <button
              v-if="view === 'list'"
              type="button"
              class="btn btn-small btn-primary"
              @click="showAddForm"
            >
              ＋ 新規追加
            </button>
          </div>

          <div v-if="view === 'list'" class="modal-body modal-body--scroll">
            <div class="modal-search">
              <input
                v-model="searchQuery"
                type="text"
                class="form-input"
                placeholder="会社名・担当者名・電話番号で検索"
              />
            </div>
            <table class="data-table select-modal-table">
              <thead>
                <tr class="data-table-header">
                  <th class="select-modal-table-th">
                    <span class="header-2line">顧客<br />電話</span>
                  </th>
                  <th class="select-modal-table-th">担当</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="c in filteredCustomers"
                  :key="c.id"
                  class="data-table-row"
                  @click="onSelect(c)"
                >
                  <td class="select-modal-table-td">
                    <div class="data-table-cell-primary">{{ c.companyName }}</div>
                    <div class="data-table-cell-secondary">{{ c.phone }}</div>
                  </td>
                  <td class="select-modal-table-td">
                    <div class="data-table-cell-primary">{{ c.contactName }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="filteredCustomers.length === 0" class="text-muted">該当する顧客がありません</p>
          </div>

          <div v-else class="modal-body">
            <div class="customer-form-grid">
              <div class="form-field">
                <label class="form-label">
                  会社名
                </label>
                <input
                  v-model="form.companyName"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': formErrors.companyName }"
                />
                <span v-if="formErrors.companyName" class="form-error">{{
                  formErrors.companyName
                }}</span>
              </div>
              <div class="form-field">
                <label class="form-label">
                  担当者名
                </label>
                <input
                  v-model="form.contactName"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': formErrors.contactName }"
                />
                <span v-if="formErrors.contactName" class="form-error">{{
                  formErrors.contactName
                }}</span>
              </div>
              <div class="form-field">
                <label class="form-label">電話番号</label>
                <input v-model="form.phone" type="tel" class="form-input" />
              </div>
              <div class="form-field">
                <label class="form-label">メールアドレス</label>
                <input v-model="form.email" type="email" class="form-input" />
              </div>
              <div class="form-field">
                <label class="form-label">住所</label>
                <input v-model="form.address" type="text" class="form-input" />
              </div>
            </div>
          </div>

          <div class="modal-footer modal-footer--end modal-footer--gap">
            <template v-if="view === 'list'">
              <button type="button" class="btn btn-secondary" @click="close">キャンセル</button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-secondary btn-secondary--slate" @click="backToList">
                キャンセル
              </button>
              <button type="button" class="btn btn-primary" @click="registerAndSelect">
                登録して選択
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
