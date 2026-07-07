<script setup lang="ts">
import type {
  Applicant,
  ApplicantCreatePayload,
  ApplicantCreateResult,
  ApplicantDeleteResult,
} from '#shared/types/applicants'
import type { Category } from '#shared/types/categories'
import type { LegalEntity } from '#shared/types/legalEntities'

const props = defineProps<{
  applicant: Applicant | null
  categories: Category[]
  legalEntities: LegalEntity[]
  submitFn: (id: number, payload: ApplicantCreatePayload) => Promise<ApplicantCreateResult>
  deleteFn: (id: number) => Promise<ApplicantDeleteResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDeleteConfirmOpen = ref(false)

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
  setLegalEntityIds,
  setContacts,
  validateContactEmailOnBlur,
  validateContactPhoneOnBlur,
} = useApplicantForm()

watch(
  () => [open.value, props.applicant] as const,
  ([isOpen, applicant]) => {
    if (isOpen && applicant) {
      resetExtendedForm({
        title: applicant.title,
        category_id: String(applicant.category_id),
        company_group: applicant.company_group ?? '',
      })
      setLegalEntityIds(applicant.legal_entities.map((entity) => entity.id))
      setContacts(applicant.contacts.map((contact) => ({ ...contact })))
      generalError.value = null
      isDeleteConfirmOpen.value = false
    }
  },
)

function close() {
  open.value = false
}

const onSubmit = handleSubmit(async () => {
  if (!props.applicant) {
    return
  }

  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn(props.applicant.id, toPayload())

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
  if (!props.applicant) {
    return
  }

  generalError.value = null
  isDeleting.value = true

  try {
    const result = await props.deleteFn(props.applicant.id)

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
    <div v-if="open && applicant" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="applicants-edit-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="applicants-edit-title" :class="$style.title">Редактирование претендента</h3>
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
          :disabled="isBusy"
          :validate-contact-email-on-blur="validateContactEmailOnBlur"
          :validate-contact-phone-on-blur="validateContactPhoneOnBlur"
        />

        <div v-if="isDeleteConfirmOpen" :class="$style.deleteConfirm">
          <p :class="$style.deleteConfirmText">Удалить претендента «{{ applicant.title }}»?</p>
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

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
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
</style>
