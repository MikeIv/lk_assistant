<script setup lang="ts">
import type { Applicant } from '#shared/types/applicants'
import type { TenantCaseApplicantFormValues } from '#shared/utils/tenantCasesSchema'

defineProps<{
  directoryApplicants: Applicant[]
  disabled?: boolean
  getFieldError: (path: string) => string | undefined
}>()

const emit = defineEmits<{
  add: []
  remove: [index: number]
  'add-negotiation': [applicantIndex: number]
  'remove-negotiation': [applicantIndex: number, negotiationIndex: number]
}>()

const applicants = defineModel<TenantCaseApplicantFormValues[]>('applicants', { required: true })

/** index → expanded; missing key = default by count (1 → open, N → closed). */
const expandedMap = ref<Record<number, boolean>>({})

const canDeleteApplicant = computed(() => applicants.value.length > 1)

function defaultExpanded(): boolean {
  return applicants.value.length <= 1
}

function isExpanded(index: number): boolean {
  return expandedMap.value[index] ?? defaultExpanded()
}

function setExpanded(index: number, value: boolean) {
  expandedMap.value = {
    ...expandedMap.value,
    [index]: value,
  }
}

/** Brief: 1 applicant → expanded; several → all collapsed. */
function resetCollapseForTabEnter() {
  const expandAll = defaultExpanded()
  const next: Record<number, boolean> = {}

  applicants.value.forEach((_, index) => {
    next[index] = expandAll
  })

  expandedMap.value = next
}

watch(
  () => applicants.value.length,
  (length, previousLength) => {
    // Dropped to a single block — force expand.
    if (length === 1 && previousLength != null && previousLength > 1) {
      expandedMap.value = { 0: true }
      return
    }

    // Prune stale indexes after delete.
    const next: Record<number, boolean> = {}
    applicants.value.forEach((_, index) => {
      if (index in expandedMap.value) {
        next[index] = expandedMap.value[index]!
      }
    })
    expandedMap.value = next
  },
)

defineExpose({
  resetCollapseForTabEnter,
})
</script>

<template>
  <div :class="$style.root" role="tabpanel">
    <BrokerCurrentCaseApplicantBlock
      v-for="(applicant, index) in applicants"
      :key="applicant.id ?? `new-${index}`"
      v-model:applicants="applicants"
      :index="index"
      :directory-applicants="directoryApplicants"
      :can-delete="canDeleteApplicant"
      :disabled="disabled"
      :get-field-error="getFieldError"
      :expanded="isExpanded(index)"
      @update:expanded="setExpanded(index, $event)"
      @remove="emit('remove', index)"
      @add-negotiation="emit('add-negotiation', index)"
      @remove-negotiation="emit('remove-negotiation', index, $event)"
    />

    <div :class="$style.addAction">
      <UiButton
        type="button"
        size="sm"
        variant="success"
        label="Добавить претендента"
        :disabled="disabled"
        @click="emit('add')"
      />
    </div>
  </div>
</template>

<style module lang="scss">
.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.addAction {
  align-self: flex-start;
}
</style>
