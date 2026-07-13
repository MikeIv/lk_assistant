<script setup lang="ts">
import type { Applicant } from '#shared/types/applicants'
import type { UiSelectOption } from '#shared/types/tenantData'
import type { TenantCaseApplicantFormValues } from '#shared/utils/tenantCasesSchema'
import { TENANT_CASE_APPLICANT_STATUS_OPTIONS } from '#shared/utils/tenantCasesTable'

const props = defineProps<{
  index: number
  directoryApplicants: Applicant[]
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

const directoryMatch = computed(() =>
  props.directoryApplicants.find(
    (item) => String(item.id) === applicant.value.tenant_applicant_id,
  ),
)

const collapsedTitle = computed(() => {
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
  TENANT_CASE_APPLICANT_STATUS_OPTIONS.map((status) => ({
    value: status,
    label: status,
    outputValue: status,
  })),
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

function negotiationError(negotiationIndex: number, field: 'date' | 'info'): string | undefined {
  return fieldError(`negotiations.${negotiationIndex}.${field}`)
}
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h4 :class="$style.title">
        {{ isExpanded ? `Претендент ${index + 1}` : collapsedTitle }}
      </h4>
      <button
        type="button"
        :class="$style.collapseBtn"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? 'Свернуть' : 'Развернуть'"
        @click="isExpanded = !isExpanded"
      >
        <UIcon
          :name="isExpanded ? 'i-arrow-chevron-dropdown-open' : 'i-arrow-chevron-dropdown'"
          :class="$style.collapseIcon"
        />
      </button>
    </header>

    <div v-show="isExpanded" :class="$style.body">
      <div :class="$style.table">
        <BrokerCurrentCaseTableRow label="Претендент">
          <template v-if="isExisting">
            <span :class="$style.readonlyValue">{{ applicant.tenant_applicant || '—' }}</span>
          </template>
          <template v-else>
            <div :class="[fieldError('tenant_applicant_id') && $style.inputWrapError]">
              <UiSelect
                v-model="applicant.tenant_applicant_id"
                :options="applicantOptions"
                placeholder="Выберите претендента"
                :disabled="disabled"
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

        <BrokerCurrentCaseTableRow label="Дата 1го контакта">
          <template v-if="isExisting">
            <span :class="$style.readonlyValue">{{ applicant.first_contact_date || '—' }}</span>
          </template>
          <template v-else>
            <div :class="[fieldError('first_contact_date') && $style.inputWrapError]">
              <UiDateInput v-model="applicant.first_contact_date" :disabled="disabled" />
            </div>
            <p v-if="fieldError('first_contact_date')" :class="$style.fieldError">
              {{ fieldError('first_contact_date') }}
            </p>
          </template>
        </BrokerCurrentCaseTableRow>
      </div>

      <div :class="$style.negotiations">
        <span :class="$style.negotiationsTitle">Переговоры</span>

        <div
          v-for="(negotiation, negotiationIndex) in applicant.negotiations"
          :key="negotiationIndex"
          :class="$style.negotiationBlock"
        >
          <div :class="$style.negotiationRow">
            <div
              :class="[
                $style.controlWrap,
                negotiationError(negotiationIndex, 'date') && $style.inputWrapError,
              ]"
            >
              <UiDateInput v-model="negotiation.date" :disabled="disabled" />
            </div>
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
          </div>

          <p v-if="negotiationError(negotiationIndex, 'date')" :class="$style.fieldError">
            {{ negotiationError(negotiationIndex, 'date') }}
          </p>
          <p v-else-if="negotiationError(negotiationIndex, 'info')" :class="$style.fieldError">
            {{ negotiationError(negotiationIndex, 'info') }}
          </p>
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
          <BrokerCurrentCaseTableRow label="Статус переговоров">
            <div :class="[fieldError('status') && $style.inputWrapError]">
              <UiSelect
                v-model="applicant.status"
                :options="statusOptions"
                placeholder="Выберите статус переговоров"
                :disabled="disabled"
              />
            </div>
            <p v-if="fieldError('status')" :class="$style.fieldError">
              {{ fieldError('status') }}
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
          label="Удалить"
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

.collapseBtn {
  @include icon-action-btn(rem(32));
  color: var(--fs-figma-achromatic-dark-gray);

  &:hover {
    color: var(--fs-figma-achromatic-black);
  }
}

.collapseIcon {
  width: rem(16);
  height: rem(16);
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
  align-items: center;
  width: 100%;

  @media (min-width: rem(640)) {
    grid-template-columns: minmax(0, rem(180)) minmax(0, 1fr) auto;
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
.controlWrap {
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
