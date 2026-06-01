<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CustomerSelectModal from '../components/CustomerSelectModal.vue'
import type { Customer } from '../data/dummy'
import { REGULATION_PATTERN_OPTIONS } from '../data/dummy'
import { orderForm, selectedCustomer, siteForm } from '../composables/useMockState'
import '../assets/styles/order.css'
import '../assets/styles/site.css'

const router = useRouter()
const modalOpen = ref(false)
const customerError = ref('')
const siteErrors = ref<Record<string, string>>({})

function openCustomerModal() {
  modalOpen.value = true
}

function onCustomerSelect(c: Customer) {
  selectedCustomer.value = c
  customerError.value = ''
}

function validateSite(): boolean {
  const e: Record<string, string> = {}
  if (!siteForm.siteName.trim()) e.siteName = '現場名称を入力してください'
  if (!siteForm.siteAddress.trim()) e.siteAddress = '現場住所を入力してください'
  siteErrors.value = e
  return Object.keys(e).length === 0
}

function goNext() {
  if (!selectedCustomer.value) {
    customerError.value = '顧客を選択してください'
    return
  }
  customerError.value = ''
  if (!validateSite()) return
  router.push('/map')
}
</script>

<template>
  <div class="page page-bg-slate">
    <div class="page-content">
      <div class="page-container page-container--form">
        <form class="order-page-layout" @submit.prevent="goNext">
          <div class="card-base card-shadow card-header-full order-card">
            <div class="page-card-header">
              <h2>発注受付</h2>
            </div>

            <div class="order-page-form site-page-form">
            <section class="customer-section">
              <div class="section-title">
                <span class="section-title-accent"></span>
                <span class="section-title-text">顧客選択</span>
              </div>
              <button type="button" class="btn btn-secondary" @click="openCustomerModal">
                顧客を選択
              </button>
              <div v-if="selectedCustomer" class="customer-selected-card">
                <div>
                  <strong>{{ selectedCustomer.companyName }}</strong>
                </div>
                <div>担当: {{ selectedCustomer.contactName }}</div>
                <div v-if="selectedCustomer.phone">TEL: {{ selectedCustomer.phone }}</div>
              </div>
              <span v-if="customerError" class="form-error">{{ customerError }}</span>
            </section>

            <section class="order-form-section">
              <div class="section-title">
                <span class="section-title-accent"></span>
                <span class="section-title-text">発注情報</span>
              </div>
              <div class="order-form-row">
                <div class="form-field order-form-field order-form-field--order-no">
                  <label class="form-label">発注番号</label>
                  <input
                    v-model="orderForm.orderNo"
                    type="text"
                    class="form-input form-input--readonly"
                    readonly
                  />
                </div>
                <div class="form-field order-form-field order-form-field--date">
                  <label class="form-label">発注日</label>
                  <input
                    v-model="orderForm.orderDate"
                    type="date"
                    class="form-input date-input"
                  />
                </div>
                <div class="form-field order-form-field order-form-field--manager">
                  <label class="form-label">担当者名</label>
                  <input v-model="orderForm.manager" type="text" class="form-input" />
                </div>
              </div>
              <div class="form-field order-form-field order-form-field--note">
                <label class="form-label">備考</label>
                <textarea v-model="orderForm.note" class="form-input" rows="3"></textarea>
              </div>
            </section>

            <section class="order-form-section site-form-section">
              <div class="section-title">
                <span class="section-title-accent"></span>
                <span class="section-title-text">現場情報</span>
              </div>

              <div class="site-form-row">
                <div class="form-field site-form-row form-field--full">
                  <label class="form-label form-label--with-badge">
                    現場名称
                    <span class="form-required-badge">必須</span>
                  </label>
                  <input
                    v-model="siteForm.siteName"
                    type="text"
                    class="form-input"
                    :class="{ 'form-input--error': siteErrors.siteName }"
                  />
                  <span v-if="siteErrors.siteName" class="form-error">{{ siteErrors.siteName }}</span>
                </div>
              </div>

              <div class="form-field">
                <label class="form-label form-label--with-badge">
                  現場住所
                  <span class="form-required-badge">必須</span>
                </label>
                <input
                  v-model="siteForm.siteAddress"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': siteErrors.siteAddress }"
                />
                <span v-if="siteErrors.siteAddress" class="form-error">{{
                  siteErrors.siteAddress
                }}</span>
              </div>

              <div class="form-field">
                <label class="form-label">工事期間</label>
                <div class="site-period-row">
                  <input
                    v-model="siteForm.periodStart"
                    type="date"
                    class="form-input date-input"
                  />
                  <span class="site-period-separator">〜</span>
                  <input v-model="siteForm.periodEnd" type="date" class="form-input date-input" />
                </div>
              </div>

              <div class="form-field">
                <label class="form-label">工事内容</label>
                <textarea v-model="siteForm.workContent" class="form-input" rows="4"></textarea>
              </div>

              <div class="form-field">
                <label class="form-label">規制パターン</label>
                <div class="radio-group">
                  <label
                    v-for="opt in REGULATION_PATTERN_OPTIONS"
                    :key="opt.value"
                    class="radio-option"
                  >
                    <input
                      v-model="siteForm.regulationPattern"
                      type="radio"
                      name="regulationPattern"
                      :value="opt.value"
                    />
                    {{ opt.label }}
                  </label>
                </div>
              </div>

              <div class="form-field regulation-length-field">
                <label class="form-label">規制区域の長さ</label>
                <div class="form-field-row">
                  <input
                    v-model="siteForm.regulationLength"
                    type="number"
                    min="0"
                    class="form-input"
                  />
                  <span class="regulation-length-unit">m</span>
                </div>
              </div>

              <div class="form-field">
                <label class="form-label">時間帯</label>
                <div class="toggle-group">
                  <label>
                    <input v-model="siteForm.timeOfDay" type="radio" value="day" />
                    <span>日中</span>
                  </label>
                  <label>
                    <input v-model="siteForm.timeOfDay" type="radio" value="night" />
                    <span>夜間</span>
                  </label>
                </div>
              </div>
            </section>
            </div>
          </div>

          <div class="form-actions order-page-actions">
            <button type="submit" class="btn btn-action">次へ</button>
          </div>
        </form>
      </div>
    </div>

    <CustomerSelectModal v-model="modalOpen" @select="onCustomerSelect" />
  </div>
</template>
