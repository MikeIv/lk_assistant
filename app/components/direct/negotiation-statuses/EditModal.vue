<script setup lang="ts">
import type {
  NegotiationStatus,
  NegotiationStatusCreatePayload,
  NegotiationStatusCreateResult,
  NegotiationStatusDeleteResult,
} from '#shared/types/negotiationStatuses'

const props = defineProps<{
  negotiationStatus: NegotiationStatus | null
  submitFn: (id: number, payload: NegotiationStatusCreatePayload) => Promise<NegotiationStatusCreateResult>
  deleteFn: (id: number) => Promise<NegotiationStatusDeleteResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDeleteConfirmOpen = ref(false)

const { handleSubmit, errors, resetForm, applyServerFieldErrors, toPayload, name, nameAttrs } =
  useNegotiationStatusForm()

watch(
  () => [open.value, props.negotiationStatus] as const,
  ([isOpen, negotiationStatus]) => {
    if (isOpen && negotiationStatus) {
      resetForm({
        values: {
          name: negotiationStatus.name,
        },
      })
      generalError.value = null
      isDeleteConfirmOpen.value = false
    }
  },
)

function close() {
  open.value = false
}

const onSubmit = handleSubmit(async () => {
  if (!props.negotiationStatus) {
    return
  }

  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn(props.negotiationStatus.id, toPayload())

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

async function handleDeleteConfirm() {
  if (!props.negotiationStatus) {
    return
  }

  generalError.value = null
  isDeleting.value = true

  try {
    const result = await props.deleteFn(props.negotiationStatus.id)

    if (result.ok) {
      close()
      return
    }

    generalError.value = result.generalError
    isDeleteConfirmOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

const isBusy = computed(() => isSubmitting.value || isDeleting.value)
</script>

<template>
  <Teleport to="body">
    <div v-if="open && negotiationStatus" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="negotiation-statuses-edit-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="negotiation-statuses-edit-title" :class="$style.title">
            Редактирование статуса переговоров
          </h3>
          <button
            type="button"
            :class="$style.closeButton"
            aria-label="Закрыть"
            :disabled="isBusy"
            @click="close"
          >
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
              :disabled="isBusy"
            />
          </div>
          <p v-if="errors.name" :class="$style.fieldError">{{ errors.name }}</p>
        </label>

        <div v-if="isDeleteConfirmOpen" :class="$style.deleteConfirm">
          <p :class="$style.deleteConfirmText">
            Удалить статус «{{ negotiationStatus.name }}»?
          </p>
          <div :class="$style.deleteConfirmActions">
            <UiButton
              type="button"
              size="sm"
              variant="warning"
              label="Удалить"
              :loading="isDeleting"
              :disabled="isBusy"
              @click="handleDeleteConfirm"
            />
            <UiButton
              type="button"
              size="sm"
              variant="soft"
              label="Отмена"
              :disabled="isBusy"
              @click="isDeleteConfirmOpen = false"
            />
          </div>
        </div>

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

        <div :class="$style.actions">
          <UiButton
            type="submit"
            size="sm"
            variant="success"
            label="Сохранить"
            :loading="isSubmitting"
            :disabled="isBusy"
          />
          <UiButton
            type="button"
            size="sm"
            variant="soft"
            label="Отменить"
            :disabled="isBusy"
            @click="close"
          />
          <UiButton
            v-if="!isDeleteConfirmOpen"
            type="button"
            size="sm"
            variant="warning"
            label="Удалить"
            :disabled="isBusy"
            @click="isDeleteConfirmOpen = true"
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
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

.deleteConfirm {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background-color: var(--fs-color-ui-button-warning-surface);
}

.deleteConfirmText {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-text);
}

.deleteConfirmActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
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
