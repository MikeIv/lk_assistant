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
    applicants?: string | null
  }
}>()

const roomId = defineModel<string>('roomId', { required: true })
const applicants = defineModel<
  Array<{
    tenant_applicant_id: string
    negotiation_status_id: string
    first_contact_date: string
    next_contact_date: string
    negotiations: Array<{ date: string; info: string }>
  }>
>('applicants', { required: true })

const applicant = computed(() => applicants.value[0]!)
const negotiation = computed(() => applicant.value.negotiations[0]!)

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
          placeholder="Выберите помещение"
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
          v-model="applicant.tenant_applicant_id"
          :options="applicantOptions"
          placeholder="Выберите претендента"
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
            v-model="applicant.first_contact_date"
            :class="$style.dateInput"
            type="date"
            :disabled="disabled"
            @change="guardDateValue(applicant.first_contact_date, $event)"
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
            v-model="applicant.negotiation_status_id"
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
        <div
          :class="[
            $style.dateInputShell,
            errors.negotiation_date && $style.inputWrapError,
          ]"
        >
          <input
            v-model="negotiation.date"
            :class="$style.dateInput"
            type="date"
            :disabled="disabled"
            @change="guardDateValue(negotiation.date, $event)"
          />
        </div>

        <div :class="[$style.infoInputWrap, errors.negotiation_info && $style.inputWrapError]">
          <UiInput
            v-model="negotiation.info"
            placeholder="Введите информацию о переговорах"
            :disabled="disabled"
          />
        </div>
      </div>

      <p v-if="errors.negotiation_date" :class="$style.fieldError">{{ errors.negotiation_date }}</p>
      <p v-else-if="errors.negotiation_info" :class="$style.fieldError">{{ errors.negotiation_info }}</p>
      <p v-else-if="errors.applicants" :class="$style.fieldError">{{ errors.applicants }}</p>
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
  align-items: stretch;

  @media (min-width: rem(560)) {
    grid-template-columns: minmax(0, rem(180)) minmax(0, 1fr);
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
