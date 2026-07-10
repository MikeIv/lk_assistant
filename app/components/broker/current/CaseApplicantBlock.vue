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
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'свернуть' : 'развернуть' }}
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
            <div
              :class="[
                $style.dateInputShell,
                fieldError('first_contact_date') && $style.inputWrapError,
              ]"
            >
              <input
                v-model="applicant.first_contact_date"
                :class="$style.dateInput"
                type="date"
                :disabled="disabled"
              />
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
                $style.dateInputShell,
                negotiationError(negotiationIndex, 'date') && $style.inputWrapError,
              ]"
            >
              <input
                v-model="negotiation.date"
                :class="$style.dateInput"
                type="date"
                :disabled="disabled"
              />
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
          </div>

          <p v-if="negotiationError(negotiationIndex, 'date')" :class="$style.fieldError">
            {{ negotiationError(negotiationIndex, 'date') }}
          </p>
          <p v-else-if="negotiationError(negotiationIndex, 'info')" :class="$style.fieldError">
            {{ negotiationError(negotiationIndex, 'info') }}
          </p>

          <div v-if="negotiationIndex > 0" :class="$style.addAction">
            <UiButton
              type="button"
              size="sm"
              variant="warning"
              label="Удалить запись"
              :disabled="disabled"
              @click="emit('remove-negotiation', negotiationIndex)"
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

      <div :class="$style.table">
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

        <BrokerCurrentCaseTableRow label="Дата следующего контакта">
          <div :class="$style.dateInputShell">
            <input
              v-model="applicant.next_contact_date"
              :class="$style.dateInput"
              type="date"
              :disabled="disabled"
            />
          </div>
        </BrokerCurrentCaseTableRow>
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
@use '~/assets/styles/tools/form-field' as field;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  @include card.content-card;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2);
}

.title {
  @include card.content-card-title;
}

.collapseBtn {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fs-color-primary);
  text-decoration: underline;
  text-underline-offset: rem(2);
  cursor: pointer;

  @include typo.fs-text-body;
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.table {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.readonlyValue {
  align-self: flex-end;

  @include card.param-value;
}

.negotiations {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  padding: rem(8) rem(16);
  border-radius: var(--fs-space-1);
  background-color: var(--fs-figma-achromatic-light-gray);
}

.negotiationsTitle {
  @include card.param-label;
}

.negotiationBlock {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.negotiationRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-1);

  @media (min-width: rem(640)) {
    grid-template-columns: minmax(0, rem(180)) minmax(0, 1fr);
  }
}

.dateInputShell,
.infoInputWrap {
  border-radius: rem(12);
  background-color: var(--fs-figma-achromatic-white);
}

.dateInputShell {
  @include field.ui-input-control-shell;
}

.dateInput {
  @include field.ui-control-text;
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
