<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { REGULATION_PATTERN_OPTIONS } from '../data/dummy'
import { siteForm } from '../composables/useMockState'
import '../assets/styles/site.css'

const router = useRouter()
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  const e: Record<string, string> = {}
  if (!siteForm.siteName.trim()) e.siteName = '現場名称を入力してください'
  if (!siteForm.siteAddress.trim()) e.siteAddress = '現場住所を入力してください'
  errors.value = e
  return Object.keys(e).length === 0
}

function goNext() {
  if (!validate()) return
  router.push('/map')
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="page page-bg-slate">
    <div class="page-content">
      <div class="page-container page-container--form">
        <div class="card-base card-shadow card-header-full">
          <div class="page-card-header">
            <h2>現場情報入力</h2>
          </div>

          <form class="site-page-form" @submit.prevent="goNext">
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
                  :class="{ 'form-input--error': errors.siteName }"
                />
                <span v-if="errors.siteName" class="form-error">{{ errors.siteName }}</span>
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
                :class="{ 'form-input--error': errors.siteAddress }"
              />
              <span v-if="errors.siteAddress" class="form-error">{{ errors.siteAddress }}</span>
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
                  <span>昼間</span>
                </label>
                <label>
                  <input v-model="siteForm.timeOfDay" type="radio" value="night" />
                  <span>夜間</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <div class="form-actions-left">
                <button type="button" class="btn btn-back" @click="goBack">戻る</button>
              </div>
              <div class="form-actions-center">
                <button type="submit" class="btn btn-action">次へ</button>
              </div>
              <div class="form-actions-right"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
