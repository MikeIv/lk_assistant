<script setup lang="ts">
import type { TenantCaseMutationResult, TenantCaseStorePayload } from '#shared/types/tenantCases'

const props = defineProps<{
  submitFn: (payload: TenantCaseStorePayload) => Promise<TenantCaseMutationResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const { rooms, applicants, isLoading: isOptionsLoading } = useTenantCaseFormOptions()

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)

const {
  handleSubmit,
  errors,
  resetTenantCaseForm,
  applyServerFieldErrors,
  toStorePayload,
  roomId,
  applicants: formApplicants,
} = useTenantCaseForm()

watch(open, (isOpen) => {
  generalError.value = null

  if (isOpen) {
    resetTenantCaseForm()
  }
})

function close() {
  open.value = false
}

const onSubmit = handleSubmit(async () => {
  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn(toStorePayload())

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
        aria-labelledby="tenant-case-create-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="tenant-case-create-title" :class="$style.title">Создание карточки дела</h3>
          <button type="button" :class="$style.closeButton" aria-label="Закрыть" @click="close">
            ×
          </button>
        </div>

        <div v-if="isOptionsLoading" :class="$style.loading">Загрузка справочников…</div>

        <BrokerCurrentFormFields
          v-else
          v-model:room-id="roomId"
          v-model:applicants="formApplicants"
          :rooms="rooms"
          :directory-applicants="applicants"
          :errors="errors"
          :disabled="isSubmitting"
        />

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

        <div :class="$style.actions">
          <UiButton
            type="submit"
            size="sm"
            variant="success"
            label="Создать"
            :loading="isSubmitting"
            :disabled="isSubmitting || isOptionsLoading"
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
  width: min(100%, rem(720));
  max-height: min(92vh, rem(900));
  padding: var(--fs-space-3);
  overflow: auto;
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

.loading {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
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
</style>
