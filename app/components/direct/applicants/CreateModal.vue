<script setup lang="ts">
import type { ApplicantCreatePayload, ApplicantCreateResult } from '#shared/types/applicants'
import type { Category } from '#shared/types/categories'
import type { LegalEntity } from '#shared/types/legalEntities'

const props = defineProps<{
  categories: Category[]
  legalEntities: LegalEntity[]
  submitFn: (payload: ApplicantCreatePayload) => Promise<ApplicantCreateResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)

const {
  handleSubmit,
  resetExtendedForm,
  applyServerFieldErrors,
  toPayload,
  titleAttrs,
  categoryIdAttrs,
  companyGroupAttrs,
  titleModel,
  categoryIdModel,
  companyGroupModel,
  legalEntityIds,
  contacts,
  formErrors,
  validateContactEmailOnBlur,
  validateContactPhoneOnBlur,
} = useApplicantForm()

watch(open, (isOpen) => {
  if (isOpen) {
    resetExtendedForm({
      title: '',
      category_id: '',
      company_group: '',
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
        aria-labelledby="applicants-create-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="applicants-create-title" :class="$style.title">Создание претендента</h3>
          <button type="button" :class="$style.closeButton" aria-label="Закрыть" @click="close">
            ×
          </button>
        </div>

        <DirectApplicantsFormFields
          v-model:title="titleModel"
          v-model:category-id="categoryIdModel"
          v-model:company-group="companyGroupModel"
          v-model:legal-entity-ids="legalEntityIds"
          v-model:contacts="contacts"
          :categories="categories"
          :legal-entities="legalEntities"
          :title-attrs="titleAttrs"
          :category-id-attrs="categoryIdAttrs"
          :company-group-attrs="companyGroupAttrs"
          :errors="formErrors"
          :disabled="isSubmitting"
          :validate-contact-email-on-blur="validateContactEmailOnBlur"
          :validate-contact-phone-on-blur="validateContactPhoneOnBlur"
        />

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
  width: min(100%, rem(560));
  max-height: min(92vh, rem(900));
  overflow: auto;
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
