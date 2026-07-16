<script setup lang="ts">
import type { Applicant } from '#shared/types/applicants'
import type { NegotiationStatus } from '#shared/types/negotiationStatuses'
import type { Premise } from '#shared/types/premises'
import type { UiSelectOption } from '#shared/types/tenantData'
import { mapNegotiationStatusesToSelectOptions } from '#shared/utils/negotiationStatusesNormalize'

const props = defineProps<{
  rooms: Premise[]
  directoryApplicants: Applicant[]
  negotiationStatuses: NegotiationStatus[]
  disabled?: boolean
  errors: {
    room_id?: string
    tenant_applicant_id?: string
    negotiation_status_id?: string
    first_contact_date?: string
    negotiation_date?: string
    negotiation_info?: string
  }
}>()

type ApplicantFormRow = {
  tenant_applicant_id: string
  negotiation_status_id: string
  first_contact_date: string
  next_contact_date: string
  negotiations: Array<{ date: string; info: string }>
}

const roomId = defineModel<string>('roomId', { required: true })
const applicants = defineModel<ApplicantFormRow[]>('applicants', { required: true })

function patchFirstApplicant(patch: Partial<ApplicantFormRow>) {
  const [first, ...rest] = applicants.value

  if (!first) {
    return
  }

  applicants.value = [{ ...first, ...patch }, ...rest]
}

function patchFirstNegotiation(patch: Partial<ApplicantFormRow['negotiations'][number]>) {
  const first = applicants.value[0]
  const negotiation = first?.negotiations[0]

  if (!first || !negotiation) {
    return
  }

  patchFirstApplicant({
    negotiations: [{ ...negotiation, ...patch }, ...first.negotiations.slice(1)],
  })
}

/** Replace `applicants[0]` on set so parent validation watch always runs. */
function firstApplicantStringModel(
  key: 'tenant_applicant_id' | 'negotiation_status_id' | 'first_contact_date',
) {
  return computed({
    get: () => applicants.value[0]?.[key] ?? '',
    set: (value: string) => patchFirstApplicant({ [key]: value }),
  })
}

function firstNegotiationStringModel(key: 'date' | 'info') {
  return computed({
    get: () => applicants.value[0]?.negotiations[0]?.[key] ?? '',
    set: (value: string) => patchFirstNegotiation({ [key]: value }),
  })
}

const tenantApplicantId = firstApplicantStringModel('tenant_applicant_id')
const negotiationStatusId = firstApplicantStringModel('negotiation_status_id')
const firstContactDate = firstApplicantStringModel('first_contact_date')
const negotiationDate = firstNegotiationStringModel('date')
const negotiationInfo = firstNegotiationStringModel('info')

const roomOptions = computed<UiSelectOption[]>(() =>
  props.rooms.map((room) => ({
    value: String(room.id),
    label: `${room.name} (этаж ${room.floor ?? '—'})`,
    outputValue: String(room.id),
  })),
)

const applicantOptions = computed<UiSelectOption[]>(() =>
  props.directoryApplicants.map((applicantItem) => ({
    value: String(applicantItem.id),
    label: applicantItem.title,
    outputValue: String(applicantItem.id),
  })),
)

const statusOptions = computed<UiSelectOption[]>(() =>
  mapNegotiationStatusesToSelectOptions(props.negotiationStatuses),
)

function guardDateValue(currentValue: string, event: Event) {
  const input = event.target as HTMLInputElement

  if (!input.value && currentValue) {
    input.value = currentValue
  }
}
</script>

<template>
  <div :class="$style.root">
    <label :class="$style.field">
      <span :class="$style.label">
        Помещение
        <span :class="$style.required">*</span>
      </span>
      <div :class="[$style.inputWrap, errors.room_id && $style.inputWrapError]">
        <UiSelect
          v-model="roomId"
          :options="roomOptions"
          placeholder="Поиск"
          searchable
          :disabled="disabled"
        />
      </div>
      <p v-if="errors.room_id" :class="$style.fieldError">{{ errors.room_id }}</p>
    </label>

    <label :class="$style.field">
      <span :class="$style.label">
        Претендент
        <span :class="$style.required">*</span>
      </span>
      <div :class="[$style.inputWrap, errors.tenant_applicant_id && $style.inputWrapError]">
        <UiSelect
          v-model="tenantApplicantId"
          :options="applicantOptions"
          placeholder="Поиск"
          searchable
          :disabled="disabled"
        />
      </div>
      <p v-if="errors.tenant_applicant_id" :class="$style.fieldError">{{ errors.tenant_applicant_id }}</p>
    </label>

    <div :class="$style.dateRow">
      <label :class="$style.field">
        <span :class="$style.label">
          Дата 1го контакта
          <span :class="$style.required">*</span>
        </span>
        <div
          :class="[
            $style.dateInputShell,
            errors.first_contact_date && $style.inputWrapError,
          ]"
        >
          <input
            v-model="firstContactDate"
            :class="$style.dateInput"
            type="date"
            :disabled="disabled"
            @change="guardDateValue(firstContactDate, $event)"
          />
        </div>
        <p v-if="errors.first_contact_date" :class="$style.fieldError">{{ errors.first_contact_date }}</p>
      </label>

      <label :class="$style.field">
        <span :class="$style.label">
          Статус
          <span :class="$style.required">*</span>
        </span>
        <div :class="[$style.inputWrap, errors.negotiation_status_id && $style.inputWrapError]">
          <UiSelect
            v-model="negotiationStatusId"
            :options="statusOptions"
            placeholder="Выберите статус переговоров"
            :disabled="disabled"
          />
        </div>
        <p v-if="errors.negotiation_status_id" :class="$style.fieldError">
          {{ errors.negotiation_status_id }}
        </p>
      </label>
    </div>

    <div :class="$style.negotiations">
      <span :class="$style.negotiationsTitle">Переговоры</span>

      <div :class="$style.negotiationRow">
        <div :class="$style.field">
          <div
            :class="[
              $style.dateInputShell,
              errors.negotiation_date && $style.inputWrapError,
            ]"
          >
            <input
              v-model="negotiationDate"
              :class="$style.dateInput"
              type="date"
              :disabled="disabled"
              @change="guardDateValue(negotiationDate, $event)"
            />
          </div>
          <p v-if="errors.negotiation_date" :class="$style.fieldError">{{ errors.negotiation_date }}</p>
        </div>

        <div :class="$style.field">
          <div :class="[$style.infoInputWrap, errors.negotiation_info && $style.inputWrapError]">
            <UiInput
              v-model="negotiationInfo"
              placeholder="Введите информацию о переговорах"
              :disabled="disabled"
            />
          </div>
          <p v-if="errors.negotiation_info" :class="$style.fieldError">{{ errors.negotiation_info }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/form-field' as field;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.label {
  font-size: rem(13);
  font-weight: 600;
  color: var(--fs-color-text);
}

.required {
  color: var(--fs-color-error);
}

.inputWrap,
.infoInputWrap {
  border-radius: rem(12);
  transition: box-shadow 0.16s ease;
}

.inputWrapError {
  animation: tenant-case-field-error-blink 1.2s ease-in-out 2;
  box-shadow: 0 0 0 2px var(--fs-color-error);
}

.fieldError {
  margin: 0;
  font-size: rem(12);
  color: var(--fs-color-error);
}

.dateRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-2);

  @media (min-width: rem(560)) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.dateInputShell {
  @include field.ui-input-control-shell;
}

.dateInput {
  @include field.ui-control-text;
}

.negotiations {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.negotiationsTitle {
  font-size: rem(13);
  font-weight: 600;
  color: var(--fs-color-text);
}

.negotiationRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-2);
  align-items: start;

  @media (min-width: rem(560)) {
    grid-template-columns: minmax(0, rem(180)) minmax(0, 1fr);
  }

  .field {
    min-width: 0;
  }
}

@keyframes tenant-case-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
