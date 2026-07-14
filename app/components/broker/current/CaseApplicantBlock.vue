<script setup lang="ts">
import type { Applicant } from '#shared/types/applicants'
import type { NegotiationStatus } from '#shared/types/negotiationStatuses'
import type { UiSelectOption } from '#shared/types/tenantData'
import type { TenantCaseApplicantFormValues } from '#shared/utils/tenantCasesSchema'
import { mapNegotiationStatusesToSelectOptions } from '#shared/utils/negotiationStatusesNormalize'

const props = defineProps<{
  index: number
  directoryApplicants: Applicant[]
  negotiationStatuses: NegotiationStatus[]
  canDelete: boolean
  disabled?: boolean
  getFieldError: (path: string) => string | undefined
}>()

const emit = defineEmits<{
  remove: []
  'add-negotiation': []
  'remove-negotiation': [negotiationIndex: number]
}>()

const applicants = defineModel<TenantCaseApplicantFormValues[]>('applicants', { required: true })
const isExpanded = defineModel<boolean>('expanded', { required: true })

const applicant = computed(() => applicants.value[props.index]!)

const isExisting = computed(() => applicant.value.id != null)

const showRequiredMarkers = computed(() => !isExisting.value)

const directoryMatch = computed(() =>
  props.directoryApplicants.find(
    (item) => String(item.id) === applicant.value.tenant_applicant_id,
  ),
)

const headerTitle = computed(() => {
  if (!isExisting.value) {
    return 'Новый претендент'
  }

  const name = applicant.value.tenant_applicant?.trim()
  if (name) {
    return name
  }

  return directoryMatch.value?.title?.trim() || 'Новый претендент'
})

const applicantOptions = computed<UiSelectOption[]>(() =>
  props.directoryApplicants.map((item) => ({
    value: String(item.id),
    label: item.title,
    outputValue: String(item.id),
  })),
)

const statusOptions = computed<UiSelectOption[]>(() =>
  mapNegotiationStatusesToSelectOptions(props.negotiationStatuses),
)

const categoryDisplay = computed(
  () =>
    applicant.value.category?.trim() ||
    directoryMatch.value?.category_name?.trim() ||
    '—',
)

watch(
  () => applicant.value.tenant_applicant_id,
  (tenantApplicantId) => {
    if (isExisting.value || !tenantApplicantId || !directoryMatch.value) {
      return
    }

    applicant.value.tenant_applicant = directoryMatch.value.title
    applicant.value.category = directoryMatch.value.category_name ?? ''
  },
)

function fieldError(suffix: string): string | undefined {
  return props.getFieldError(`applicants.${props.index}.${suffix}`)
}

function hasFieldError(suffix: string): boolean {
  return Boolean(fieldError(suffix))
}

function negotiationError(negotiationIndex: number, field: 'date' | 'info'): string | undefined {
  return fieldError(`negotiations.${negotiationIndex}.${field}`)
}

function hasNegotiationError(negotiationIndex: number, field: 'date' | 'info'): boolean {
  return Boolean(negotiationError(negotiationIndex, field))
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <section :class="$style.root">
    <button
      type="button"
      :class="$style.header"
      :aria-expanded="isExpanded"
      :aria-label="isExpanded ? `Свернуть: ${headerTitle}` : `Развернуть: ${headerTitle}`"
      @click="toggleExpanded"
    >
      <span :class="$style.title">{{ headerTitle }}</span>
      <UIcon
        :name="isExpanded ? 'i-arrow-chevron-dropdown-open' : 'i-arrow-chevron-dropdown'"
        :class="$style.collapseIcon"
        aria-hidden="true"
      />
    </button>

    <div v-show="isExpanded" :class="$style.body">
      <div :class="$style.table">
        <BrokerCurrentCaseTableRow label="Претендент" :required="showRequiredMarkers">
          <template v-if="isExisting">
            <span :class="$style.readonlyValue">{{ applicant.tenant_applicant || '—' }}</span>
          </template>
          <template v-else>
            <div :class="$style.inputWrap">
              <UiSelect
                v-model="applicant.tenant_applicant_id"
                :options="applicantOptions"
                placeholder="Выберите претендента"
                :disabled="disabled"
                :invalid="hasFieldError('tenant_applicant_id')"
              />
            </div>
            <p v-if="fieldError('tenant_applicant_id')" :class="$style.fieldError">
              {{ fieldError('tenant_applicant_id') }}
            </p>
          </template>
        </BrokerCurrentCaseTableRow>

        <BrokerCurrentCaseTableRow label="Категория">
          <span :class="$style.readonlyValue">{{ categoryDisplay }}</span>
        </BrokerCurrentCaseTableRow>

        <BrokerCurrentCaseTableRow label="Дата 1го контакта" :required="showRequiredMarkers">
          <template v-if="isExisting">
            <span :class="$style.readonlyValue">{{ applicant.first_contact_date || '—' }}</span>
          </template>
          <template v-else>
            <div :class="$style.inputWrap">
              <UiDateInput
                v-model="applicant.first_contact_date"
                :disabled="disabled"
                :invalid="hasFieldError('first_contact_date')"
              />
            </div>
            <p v-if="fieldError('first_contact_date')" :class="$style.fieldError">
              {{ fieldError('first_contact_date') }}
            </p>
          </template>
        </BrokerCurrentCaseTableRow>
      </div>

      <div :class="$style.negotiations">
        <span :class="$style.negotiationsTitle">
          Переговоры<span v-if="showRequiredMarkers" :class="$style.required" aria-hidden="true"> *</span>
        </span>

        <div
          v-for="(negotiation, negotiationIndex) in applicant.negotiations"
          :key="negotiationIndex"
          :class="$style.negotiationBlock"
        >
          <div :class="$style.negotiationRow">
            <div :class="$style.negotiationCol">
              <div :class="$style.controlWrap">
                <UiDateInput
                  v-model="negotiation.date"
                  :disabled="disabled"
                  :invalid="hasNegotiationError(negotiationIndex, 'date')"
                />
              </div>
              <p v-if="negotiationError(negotiationIndex, 'date')" :class="$style.fieldError">
                {{ negotiationError(negotiationIndex, 'date') }}
              </p>
            </div>
            <div :class="$style.negotiationCol">
              <div
                :class="[
                  $style.infoInputWrap,
                  negotiationError(negotiationIndex, 'info') && $style.inputWrapError,
                ]"
              >
                <UiInput
                  v-model="negotiation.info"
                  placeholder="Введите информацию о переговорах"
                  :disabled="disabled"
                />
              </div>
              <p v-if="negotiationError(negotiationIndex, 'info')" :class="$style.fieldError">
                {{ negotiationError(negotiationIndex, 'info') }}
              </p>
            </div>
            <button
              v-if="negotiationIndex > 0"
              type="button"
              :class="$style.removeNegotiationBtn"
              aria-label="Удалить запись"
              :disabled="disabled"
              @click="emit('remove-negotiation', negotiationIndex)"
            >
              <UIcon name="i-local-trash" :class="$style.removeNegotiationIcon" />
            </button>
            <span
              v-else
              :class="$style.removeNegotiationSpacer"
              aria-hidden="true"
            />
          </div>
        </div>

        <div :class="$style.addAction">
          <UiButton
            type="button"
            size="sm"
            variant="success"
            label="Добавить запись"
            :disabled="disabled"
            @click="emit('add-negotiation')"
          />
        </div>
      </div>

      <div :class="$style.statusDateRow">
        <div :class="[$style.table, $style.statusTable]">
          <BrokerCurrentCaseTableRow label="Статус переговоров" :required="showRequiredMarkers">
            <div :class="$style.inputWrap">
              <UiSelect
                v-model="applicant.negotiation_status_id"
                :options="statusOptions"
                placeholder="Выберите статус переговоров"
                :disabled="disabled"
                :invalid="hasFieldError('negotiation_status_id')"
              />
            </div>
            <p v-if="fieldError('negotiation_status_id')" :class="$style.fieldError">
              {{ fieldError('negotiation_status_id') }}
            </p>
          </BrokerCurrentCaseTableRow>
        </div>

        <div :class="[$style.table, $style.nextDateTable]">
          <BrokerCurrentCaseTableRow label="Дата следующего контакта">
            <UiDateInput v-model="applicant.next_contact_date" :disabled="disabled" />
          </BrokerCurrentCaseTableRow>
        </div>
      </div>

      <div v-if="canDelete" :class="$style.footer">
        <UiButton
          type="button"
          size="sm"
          variant="warning"
          label="Удалить претендента"
          :disabled="disabled"
          @click="emit('remove')"
        />
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  @include card.content-card;
  background-color: var(--fs-figma-achromatic-light-gray);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2);
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: rem(8);
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }

  &:hover .collapseIcon {
    color: var(--fs-figma-achromatic-black);
  }
}

.title {
  @include card.content-card-title;
  font-weight: 700;
}

@mixin icon-action-btn($size) {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: $size;
  height: $size;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: rem(8);
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

.collapseIcon {
  flex-shrink: 0;
  width: rem(16);
  height: rem(16);
  color: var(--fs-figma-achromatic-dark-gray);
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.table {
  display: grid;
  grid-template-columns: max-content minmax(0, rem(420));
  align-items: center;
  column-gap: rem(24);
  row-gap: var(--fs-space-1);
  width: fit-content;
  max-width: 100%;
}

.statusDateRow {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--fs-space-1) var(--fs-space-2);
  width: 100%;
  max-width: 100%;

  @media (min-width: rem(640)) {
    flex-wrap: nowrap;
  }
}

.statusTable {
  flex: 1 1 0;
  width: auto;
  min-width: 0;
  max-width: none;
  grid-template-columns: max-content minmax(0, 1fr);

  @media (max-width: rem(639)) {
    flex: 1 1 100%;
    min-width: min(100%, rem(300));
    width: 100%;
  }
}

.nextDateTable {
  flex: 0 0 auto;
  width: fit-content;
  min-width: min(100%, rem(300));
  margin-left: auto;
  grid-template-columns: max-content minmax(rem(180), rem(220));
}

.readonlyValue {
  display: block;
  width: 100%;
  font-size: rem(14);
  line-height: 1.4;
  font-weight: 600;
  color: var(--fs-figma-achromatic-black);
  text-align: right;
}

.negotiations {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  width: 100%;
  max-width: 100%;
  padding: rem(8) rem(16);
  border-radius: var(--fs-space-1);
  background-color: var(--fs-figma-achromatic-white);
}

.negotiationsTitle {
  font-size: rem(14);
  line-height: 1.4;
  font-weight: 700;
  color: var(--fs-figma-achromatic-black);
}

.required {
  color: var(--fs-color-error);
}

.negotiationBlock {
  display: flex;
  flex-direction: column;
  gap: rem(8);
  width: 100%;
}

.negotiationRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-1);
  align-items: start;
  width: 100%;

  @media (min-width: rem(640)) {
    grid-template-columns: minmax(0, rem(180)) minmax(0, 1fr) rem(52);
  }
}

.negotiationCol {
  display: flex;
  flex-direction: column;
  gap: rem(4);
  min-width: 0;
}

.removeNegotiationSpacer {
  display: none;
  flex-shrink: 0;

  @media (min-width: rem(640)) {
    display: block;
    width: rem(52);
    height: rem(52);
  }
}

.removeNegotiationBtn {
  @include icon-action-btn(rem(52));
  justify-self: end;
  color: var(--fs-color-warning);

  @media (min-width: rem(640)) {
    justify-self: center;
  }

  &:hover:not(:disabled) {
    color: color-mix(in srgb, var(--fs-color-warning) 82%, black);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.removeNegotiationIcon {
  width: rem(32);
  height: rem(32);
}

.infoInputWrap,
.controlWrap,
.inputWrap {
  border-radius: rem(12);
  background-color: var(--fs-figma-achromatic-white);
}

.inputWrapError {
  animation: tenant-case-card-field-error-blink 1.2s ease-in-out 2;
  box-shadow: 0 0 0 2px var(--fs-color-error);
  border-radius: rem(12);
}

.fieldError {
  margin: rem(4) 0 0;
  font-size: rem(12);
  color: var(--fs-color-error);
}

.addAction {
  align-self: flex-start;
}

.footer {
  display: flex;
  justify-content: flex-end;
}

@keyframes tenant-case-card-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
