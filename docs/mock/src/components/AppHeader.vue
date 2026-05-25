<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const steps = [
  { num: '①', label: '発注受付', path: '/', step: 1 },
  { num: '②', label: '現場情報', path: '/site', step: 2 },
  { num: '③', label: '地図加工', path: '/map', step: 3 },
]

const currentStep = computed(() => {
  const step = route.meta.step as number | undefined
  return step && step >= 1 && step <= 3 ? step : 0
})

const showSteps = computed(() => currentStep.value > 0)
</script>

<template>
  <header class="app-header">
    <div class="app-header-brand">
      <span class="app-header-logo">RoadFlow</span>
      <span v-if="showSteps" class="app-header-subtitle">交通規制図・資機材調達</span>
    </div>
    <nav v-if="showSteps" class="app-header-steps" aria-label="作業ステップ">
      <template v-for="(step, index) in steps" :key="step.num">
        <span
          class="app-header-step"
          :class="{ 'app-header-step--active': currentStep === step.step }"
        >
          {{ step.num }} {{ step.label }}
        </span>
        <span v-if="index < steps.length - 1" class="app-header-step-arrow">→</span>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: 100;
  background-color: var(--color-main);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.app-header-brand {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.app-header-logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.app-header-subtitle {
  font-size: 0.625rem;
  opacity: 0.85;
  font-weight: 400;
}

.app-header-steps {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
}

.app-header-step {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  opacity: 0.65;
  transition: all 0.2s;
}

.app-header-step--active {
  opacity: 1;
  background: rgb(255 255 255 / 0.15);
  font-weight: 700;
}

.app-header-step-arrow {
  opacity: 0.5;
  font-size: 0.625rem;
}
</style>
