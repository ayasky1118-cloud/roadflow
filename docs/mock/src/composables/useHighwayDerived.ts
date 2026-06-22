import { computed } from 'vue'
import type { HighwayTemplateKey } from '../data/highwayTemplates'
import { getHighwayTemplate } from '../data/highwayTemplates'
import {
  calcRegulation,
  parseKp,
  formatKp,
  DEFAULT_REGULATION_MARGIN,
  type RegulationCalcResult,
} from '../utils/highwayCalc'
import { buildSchematicLayout, type SchematicLayout } from '../utils/highwaySchematic'

export interface HighwayFormInput {
  template: HighwayTemplateKey
  constructionKpStart: string
  constructionKpEnd: string
  useManualRegulation: boolean
  manualRegulationKpStart: string
  manualRegulationKpEnd: string
}

export interface DerivedRegulation {
  supported: boolean
  template: HighwayTemplateKey
  constructionKpStart: number | null
  constructionKpEnd: number | null
  regulationKpStart: number | null
  regulationKpEnd: number | null
  constructionLengthM: number | null
  regulationLengthM: number | null
  regulationKpStartLabel: string
  regulationKpEndLabel: string
  source: 'auto' | 'manual' | 'none'
}

function buildManualRegulation(
  form: HighwayFormInput,
  constructionKpStart: number | null,
  constructionKpEnd: number | null
): DerivedRegulation | null {
  const start = parseKp(form.manualRegulationKpStart)
  const end = parseKp(form.manualRegulationKpEnd)
  if (start === null || end === null) return null

  const isUp = form.template.startsWith('上り')
  const constructionLengthM =
    constructionKpStart !== null && constructionKpEnd !== null
      ? Math.round(
          (isUp
            ? constructionKpStart - constructionKpEnd
            : constructionKpEnd - constructionKpStart) *
            1000 *
            10
        ) / 10
      : null
  const regulationLengthM =
    Math.round((isUp ? start - end : end - start) * 1000 * 10) / 10

  return {
    supported: true,
    template: form.template,
    constructionKpStart,
    constructionKpEnd,
    regulationKpStart: start,
    regulationKpEnd: end,
    constructionLengthM,
    regulationLengthM,
    regulationKpStartLabel: form.manualRegulationKpStart,
    regulationKpEndLabel: form.manualRegulationKpEnd,
    source: 'manual',
  }
}

function fromCalcResult(
  template: HighwayTemplateKey,
  result: RegulationCalcResult,
  constructionKpStart: number,
  constructionKpEnd: number
): DerivedRegulation {
  return {
    supported: result.supported,
    template,
    constructionKpStart,
    constructionKpEnd,
    regulationKpStart: result.regulationKpStart,
    regulationKpEnd: result.regulationKpEnd,
    constructionLengthM: result.constructionLengthM,
    regulationLengthM: result.regulationLengthM,
    regulationKpStartLabel: formatKp(result.regulationKpStart),
    regulationKpEndLabel: formatKp(result.regulationKpEnd),
    source: 'auto',
  }
}

function computeAutoRegulation(form: HighwayFormInput): DerivedRegulation {
  const constructionKpStart = parseKp(form.constructionKpStart)
  const constructionKpEnd = parseKp(form.constructionKpEnd)

  if (constructionKpStart === null || constructionKpEnd === null) {
    return {
      supported: false,
      template: form.template,
      constructionKpStart,
      constructionKpEnd,
      regulationKpStart: null,
      regulationKpEnd: null,
      constructionLengthM: null,
      regulationLengthM: null,
      regulationKpStartLabel: '—',
      regulationKpEndLabel: '—',
      source: 'none',
    }
  }

  const result = calcRegulation(
    form.template,
    constructionKpStart,
    constructionKpEnd,
    DEFAULT_REGULATION_MARGIN
  )
  return fromCalcResult(form.template, result, constructionKpStart, constructionKpEnd)
}

export function useHighwayDerived(form: HighwayFormInput) {
  const templateDef = computed(() => getHighwayTemplate(form.template))

  const autoDerivedRegulation = computed(() => computeAutoRegulation(form))

  const derivedRegulation = computed((): DerivedRegulation => {
    if (form.useManualRegulation) {
      const constructionKpStart = parseKp(form.constructionKpStart)
      const constructionKpEnd = parseKp(form.constructionKpEnd)
      const manual = buildManualRegulation(form, constructionKpStart, constructionKpEnd)
      if (manual) return manual
    }

    return autoDerivedRegulation.value
  })

  const schematicLayout = computed((): SchematicLayout => {
    const d = derivedRegulation.value
    return buildSchematicLayout({
      template: d.template,
      constructionKpStart: d.constructionKpStart,
      constructionKpEnd: d.constructionKpEnd,
      regulationKpStart: d.regulationKpStart,
      regulationKpEnd: d.regulationKpEnd,
    })
  })

  return {
    templateDef,
    autoDerivedRegulation,
    derivedRegulation,
    schematicLayout,
  }
}
