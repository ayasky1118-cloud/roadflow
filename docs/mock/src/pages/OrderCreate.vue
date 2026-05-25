<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CustomerSelectModal from '../components/CustomerSelectModal.vue'
import type { Customer } from '../data/dummy'
import { orderForm, selectedCustomer } from '../composables/useMockState'
import '../assets/styles/order.css'

const router = useRouter()
const modalOpen = ref(false)
const customerError = ref('')

function openCustomerModal() {
  modalOpen.value = true
}

function onCustomerSelect(c: Customer) {
  selectedCustomer.value = c
  customerError.value = ''
}

function goNext() {
  if (!selectedCustomer.value) {
    customerError.value = '顧客を選択してください'
    return
  }
  router.push('/site')
}
</script>

<template>
  <div class="page page-bg-slate">
    <div class="page-content">
      <div class="page-container page-container--order">
        <div class="card-base card-shadow card-header-full order-card">
          <div class="page-card-header">
            <h2>発注受付</h2>
          </div>

          <form class="order-page-form" @submit.prevent="goNext">
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

            <div class="form-actions">
              <div class="form-actions-left"></div>
              <div class="form-actions-center">
                <button type="submit" class="btn btn-action">次へ</button>
              </div>
              <div class="form-actions-right"></div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <CustomerSelectModal v-model="modalOpen" @select="onCustomerSelect" />
  </div>
</template>
