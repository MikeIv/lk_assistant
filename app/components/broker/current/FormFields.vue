<script setup lang="ts">
import type { Applicant } from '#shared/types/applicants'
import type { Premise } from '#shared/types/premises'
import type { UiSelectOption } from '#shared/types/tenantData'

const props = defineProps<{
  rooms: Premise[]
  directoryApplicants: Applicant[]
  disabled?: boolean
  errors: {
    room_id?: string
    responsible_name?: string
    applicants?: string | null
  }
}>()

const roomId = defineModel<string>('roomId', { required: true })
const responsibleName = defineModel<string>('responsibleName', { required: true })
const applicants = defineModel<
  Array<{
    tenant_applicant_id: string
    status: string
    first_contact_date: string
    next_contact_date: string
    negotiations: Array<{ date: string; info: string }>
  }>
>('applicants', { required: true })

const emit = defineEmits<{
  addApplicant: []
  removeApplicant: [index: number]
  addNegotiation: [applicantIndex: number]
  removeNegotiation: [applicantIndex: number, negotiationIndex: number]
}>()

const roomOptions = computed<UiSelectOption[]>(() =>
  props.rooms.map((room) => ({
    value: String(room.id),
    label: `${room.name} (этаж ${room.floor ?? '—'})`,
    outputValue: String(room.id),
  })),
)

const applicantOptions = computed<UiSelectOption[]>(() =>
  props.directoryApplicants.map((applicant) => ({
    value: String(applicant.id),
    label: applicant.title,
    outputValue: String(applicant.id),
  })),
)

const statusOptions = computed<UiSelectOption[]>(() =>
  ['переговоры', 'отказ', 'отказ с нашей стороны'].map((status) => ({
    value: status,
    label: status,
    outputValue: status,
  })),
)
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
      <span :class="$style.label">Ответственный</span>
      <div :class="[$style.inputWrap, errors.responsible_name && $style.inputWrapError]">
        <UiInput
          v-model="responsibleName"
          placeholder="ФИО ответственного"
          :disabled="disabled"
        />
      </div>
      <p v-if="errors.responsible_name" :class="$style.fieldError">{{ errors.responsible_name }}</p>
    </label>

    <div :class="$style.section">
      <div :class="$style.sectionHeader">
        <h4 :class="$style.sectionTitle">Претенденты</h4>
        <UiButton
          type="button"
          size="sm"
          variant="soft"
          label="Добавить претендента"
          :disabled="disabled"
          @click="emit('addApplicant')"
        />
      </div>

      <p v-if="errors.applicants" :class="$style.fieldError">{{ errors.applicants }}</p>

      <article
        v-for="(applicant, applicantIndex) in applicants"
        :key="applicantIndex"
        :class="$style.applicantCard"
      >
        <div :class="$style.applicantHeader">
          <h5 :class="$style.applicantTitle">Претендент {{ applicantIndex + 1 }}</h5>
          <UiButton
            v-if="applicants.length > 1"
            type="button"
            size="sm"
            variant="soft"
            label="Удалить"
            :disabled="disabled"
            @click="emit('removeApplicant', applicantIndex)"
          />
        </div>

        <label :class="$style.field">
          <span :class="$style.label">
            Претендент
            <span :class="$style.required">*</span>
          </span>
          <UiSelect
            v-model="applicant.tenant_applicant_id"
            :options="applicantOptions"
            placeholder="Выберите претендента"
            :disabled="disabled"
          />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">
            Статус
            <span :class="$style.required">*</span>
          </span>
          <UiSelect
            v-model="applicant.status"
            :options="statusOptions"
            placeholder="Выберите статус"
            :disabled="disabled"
          />
        </label>

        <div :class="$style.dateRow">
          <label :class="$style.field">
            <span :class="$style.label">
              Дата 1го контакта
              <span :class="$style.required">*</span>
            </span>
            <input
              v-model="applicant.first_contact_date"
              :class="$style.dateInput"
              type="date"
              :disabled="disabled"
            />
          </label>

          <label :class="$style.field">
            <span :class="$style.label">Дата след. контакта</span>
            <input
              v-model="applicant.next_contact_date"
              :class="$style.dateInput"
              type="date"
              :disabled="disabled"
            />
          </label>
        </div>

        <div :class="$style.negotiations">
          <div :class="$style.sectionHeader">
            <span :class="$style.negotiationsTitle">Переговоры</span>
            <UiButton
              type="button"
              size="sm"
              variant="soft"
              label="Добавить запись"
              :disabled="disabled"
              @click="emit('addNegotiation', applicantIndex)"
            />
          </div>

          <div
            v-for="(negotiation, negotiationIndex) in applicant.negotiations"
            :key="negotiationIndex"
            :class="$style.negotiationRow"
          >
            <input
              v-model="negotiation.date"
              :class="$style.dateInput"
              type="date"
              :disabled="disabled"
            />
            <UiInput
              v-model="negotiation.info"
              placeholder="Информация о переговорах"
              :disabled="disabled"
            />
            <UiButton
              type="button"
              size="sm"
              variant="soft"
              label="×"
              :disabled="disabled"
              @click="emit('removeNegotiation', applicantIndex, negotiationIndex)"
            />
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

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

.inputWrap {
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

.section {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.sectionHeader {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
}

.sectionTitle {
  margin: 0;

  @include typo.fs-text-h4;
}

.applicantCard {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(12);
  background-color: rgb(244 245 245 / 0.35);
}

.applicantHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
}

.applicantTitle {
  margin: 0;
  font-size: rem(14);
  font-weight: 600;
}

.dateRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-2);

  @media (min-width: rem(560)) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.dateInput {
  width: 100%;
  padding: rem(10) rem(14);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(12);
  font: inherit;
  color: var(--fs-color-text);
  background-color: var(--fs-color-bg);

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.negotiations {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.negotiationsTitle {
  font-size: rem(13);
  font-weight: 600;
}

.negotiationRow {
  display: grid;
  grid-template-columns: rem(150) minmax(0, 1fr) auto;
  gap: var(--fs-space-1);
  align-items: center;
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
