<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addCustomer, selectedCustomer } from '../composables/useMockState'
import '../assets/styles/customer.css'

const router = useRouter()

const form = ref({
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  address: '',
})

const errors = ref<Record<string, string>>({})

function validate(): boolean {
  const e: Record<string, string> = {}
  if (!form.value.companyName.trim()) e.companyName = '会社名を入力してください'
  if (!form.value.contactName.trim()) e.contactName = '担当者名を入力してください'
  errors.value = e
  return Object.keys(e).length === 0
}

function submit() {
  if (!validate()) return
  const created = addCustomer({
    companyName: form.value.companyName.trim(),
    contactName: form.value.contactName.trim(),
    phone: form.value.phone.trim(),
    email: form.value.email.trim() || undefined,
    address: form.value.address.trim() || undefined,
  })
  selectedCustomer.value = created
  router.push('/')
}

function cancel() {
  router.push('/')
}
</script>

<template>
  <div class="page page-bg-slate">
    <div class="page-content">
      <div class="page-container page-container--form">
        <div class="card-base card-shadow card-header-full">
          <div class="page-card-header">
            <h2>顧客登録</h2>
          </div>

          <form class="customer-page-form" @submit.prevent="submit">
            <div class="form-field">
              <label class="form-label">
                会社名
              </label>
              <input
                v-model="form.companyName"
                type="text"
                class="form-input"
                :class="{ 'form-input--error': errors.companyName }"
              />
              <span v-if="errors.companyName" class="form-error">{{ errors.companyName }}</span>
            </div>
            <div class="form-field">
              <label class="form-label">
                担当者名
              </label>
              <input
                v-model="form.contactName"
                type="text"
                class="form-input"
                :class="{ 'form-input--error': errors.contactName }"
              />
              <span v-if="errors.contactName" class="form-error">{{ errors.contactName }}</span>
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

            <div class="form-actions">
              <div class="form-actions-left">
                <button type="button" class="btn btn-back" @click="cancel">キャンセル</button>
              </div>
              <div class="form-actions-center">
                <button type="submit" class="btn btn-action">登録して選択</button>
              </div>
              <div class="form-actions-right"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
