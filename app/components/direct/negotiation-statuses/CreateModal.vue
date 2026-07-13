<script setup lang="ts">
import type {
  NegotiationStatusCreatePayload,
  NegotiationStatusCreateResult,
} from '#shared/types/negotiationStatuses'

const props = defineProps<{
  submitFn: (payload: NegotiationStatusCreatePayload) => Promise<NegotiationStatusCreateResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)

const { handleSubmit, errors, resetForm, applyServerFieldErrors, toPayload, name, nameAttrs } =
  useNegotiationStatusForm()

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm({
      values: {
        name: '',
      },
    })
    generalError.value = null
  }
})

function close() {
  open.value = false
}

const onSubmit = handleSubmit(async () => {
  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn(toPayload())

    if (result.ok) {
      close()
      return
    }

    applyServerFieldErrors(result.fieldErrors)
    generalError.value = result.generalError
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="negotiation-statuses-create-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="negotiation-statuses-create-title" :class="$style.title">
            Создание статуса переговоров
          </h3>
          <button type="button" :class="$style.closeButton" aria-label="Закрыть" @click="close">
            ×
          </button>
        </div>

        <label :class="$style.field">
          <span :class="$style.label">
            Наименование
            <span :class="$style.required">*</span>
          </span>
          <div :class="[$style.inputWrap, errors.name && $style.inputWrapError]">
            <UiInput
              v-model="name"
              v-bind="nameAttrs"
              placeholder="Введите наименование"
              :disabled="isSubmitting"
            />
          </div>
          <p v-if="errors.name" :class="$style.fieldError">{{ errors.name }}</p>
        </label>

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

        <div :class="$style.actions">
          <UiButton
            type="submit"
            size="sm"
            variant="success"
            label="Создать"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
          <UiButton
            type="button"
            size="sm"
            variant="soft"
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
  animation: negotiation-statuses-field-error-blink 1.2s ease-in-out 2;
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

@keyframes negotiation-statuses-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
