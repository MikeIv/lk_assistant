<script setup lang="ts">
import type {
  LegalEntityCreateFieldErrors,
  LegalEntityCreatePayload,
  LegalEntityCreateResult,
} from '#shared/types/legalEntities'
import { emptyLegalEntityCreateFieldErrors } from '#shared/utils/legalEntitiesValidation'

const props = defineProps<{
  submitFn: (payload: LegalEntityCreatePayload) => Promise<LegalEntityCreateResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const legalEntity = ref('')
const inn = ref('')
const kpp = ref('')
const fieldErrors = ref<LegalEntityCreateFieldErrors>(emptyLegalEntityCreateFieldErrors())
const generalError = ref<string | null>(null)
const isSubmitting = ref(false)

function resetForm() {
  legalEntity.value = ''
  inn.value = ''
  kpp.value = ''
  fieldErrors.value = emptyLegalEntityCreateFieldErrors()
  generalError.value = null
}

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})

function close() {
  open.value = false
}

function clearFieldError(field: keyof LegalEntityCreateFieldErrors) {
  if (fieldErrors.value[field]) {
    fieldErrors.value = { ...fieldErrors.value, [field]: null }
  }
}

watch(legalEntity, () => clearFieldError('legal_entity'))
watch(inn, () => clearFieldError('inn'))
watch(kpp, () => clearFieldError('kpp'))

async function handleSubmit() {
  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn({
      legal_entity: legalEntity.value,
      inn: inn.value,
      kpp: kpp.value.trim() ? kpp.value : null,
    })

    if (result.ok) {
      close()
      return
    }

    fieldErrors.value = result.fieldErrors
    generalError.value = result.generalError
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lg-entities-create-title"
        @submit.prevent="handleSubmit"
      >
        <div :class="$style.header">
          <h3 id="lg-entities-create-title" :class="$style.title">Создание юридического лица</h3>
          <button type="button" :class="$style.closeButton" aria-label="Закрыть" @click="close">
            ×
          </button>
        </div>

        <label :class="$style.field">
          <span :class="$style.label">
            Наименование юридического лица
            <span :class="$style.required">*</span>
          </span>
          <div :class="[$style.inputWrap, fieldErrors.legal_entity && $style.inputWrapError]">
            <UiInput
              v-model="legalEntity"
              placeholder="Введите наименование"
              :disabled="isSubmitting"
            />
          </div>
          <p v-if="fieldErrors.legal_entity" :class="$style.fieldError">
            {{ fieldErrors.legal_entity }}
          </p>
        </label>

        <label :class="$style.field">
          <span :class="$style.label">
            ИНН
            <span :class="$style.required">*</span>
          </span>
          <div :class="[$style.inputWrap, fieldErrors.inn && $style.inputWrapError]">
            <UiInput
              v-model="inn"
              placeholder="Введите ИНН"
              inputmode="numeric"
              :disabled="isSubmitting"
            />
          </div>
          <p v-if="fieldErrors.inn" :class="$style.fieldError">{{ fieldErrors.inn }}</p>
        </label>

        <label :class="$style.field">
          <span :class="$style.label">КПП</span>
          <div :class="[$style.inputWrap, fieldErrors.kpp && $style.inputWrapError]">
            <UiInput
              v-model="kpp"
              placeholder="Введите КПП"
              inputmode="numeric"
              :disabled="isSubmitting"
            />
          </div>
          <p v-if="fieldErrors.kpp" :class="$style.fieldError">{{ fieldErrors.kpp }}</p>
        </label>

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

        <div :class="$style.actions">
          <UiButton
            type="submit"
            size="sm"
            variant="primary"
            label="Создать"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
          <UiButton
            type="button"
            size="sm"
            variant="outline"
            label="Отменить"
            :disabled="isSubmitting"
            @click="close"
          />
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fs-space-2);
  background: rgb(23 23 32 / 0.45);
}

.dialog {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: min(100%, rem(480));
  padding: var(--fs-space-3);
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fs-space-2);
}

.title {
  margin: 0;

  @include typo.fs-text-h4;
}

.closeButton {
  flex-shrink: 0;
  width: rem(32);
  height: rem(32);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: rem(8);
  font-size: rem(24);
  line-height: 1;
  color: var(--fs-color-text-muted);
  background: transparent;
  cursor: pointer;

  &:hover {
    color: var(--fs-color-text);
    background-color: var(--fs-figma-achromatic-light-gray);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
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
  animation: lg-entities-field-error-blink 1.2s ease-in-out 2;
  box-shadow: 0 0 0 2px var(--fs-color-error);
}

.fieldError {
  margin: 0;
  font-size: rem(12);
  color: var(--fs-color-error);
}

.generalError {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-error);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  margin-top: var(--fs-space-1);
}

@keyframes lg-entities-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
