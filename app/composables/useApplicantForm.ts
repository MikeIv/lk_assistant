import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { Ref } from 'vue'

import type {
  ApplicantContact,
  ApplicantCreateFieldErrors,
  ApplicantCreatePayload,
} from '#shared/types/applicants'
import { applicantFormSchema } from '#shared/utils/applicantsSchema'
import { normalizeApplicantCreatePayload } from '#shared/utils/applicantsValidation'

const FORM_FIELD_KEYS = ['title', 'category_id', 'company_group'] as const satisfies ReadonlyArray<
  keyof ApplicantCreateFieldErrors
>

export interface ApplicantFormInitialValues {
  title: string
  category_id: string
  company_group: string
}

const EMPTY_FORM_VALUES: ApplicantFormInitialValues = {
  title: '',
  category_id: '',
  company_group: '',
}

function createStringFieldModel(field: Ref<string | undefined>) {
  return computed({
    get: () => field.value ?? '',
    set: (value: string) => {
      field.value = value
    },
  })
}

export function useApplicantForm(initialValues: ApplicantFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(applicantFormSchema),
    initialValues: { ...initialValues },
  })

  const [title, titleAttrs] = form.defineField('title')
  const [categoryId, categoryIdAttrs] = form.defineField('category_id')
  const [companyGroup, companyGroupAttrs] = form.defineField('company_group')

  const legalEntityIds = ref<number[]>([])
  const contacts = ref<ApplicantContact[]>([])
  const extraFieldErrors = ref<Pick<ApplicantCreateFieldErrors, 'legal_entity_ids' | 'contacts'>>({
    legal_entity_ids: null,
    contacts: null,
  })

  const titleModel = createStringFieldModel(title)
  const categoryIdModel = createStringFieldModel(categoryId)
  const companyGroupModel = createStringFieldModel(companyGroup)

  const formErrors = computed(() => ({
    title: form.errors.value.title,
    category_id: form.errors.value.category_id,
    company_group: form.errors.value.company_group,
    legal_entity_ids: extraFieldErrors.value.legal_entity_ids,
    contacts: extraFieldErrors.value.contacts,
  }))

  function applyServerFieldErrors(fieldErrors: ApplicantCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }

    extraFieldErrors.value = {
      legal_entity_ids: fieldErrors.legal_entity_ids,
      contacts: fieldErrors.contacts,
    }
  }

  function toPayload(): ApplicantCreatePayload {
    const categoryIdValue = Number(form.values.category_id)

    return normalizeApplicantCreatePayload({
      title: form.values.title ?? '',
      category_id: Number.isFinite(categoryIdValue) ? categoryIdValue : 0,
      company_group: form.values.company_group ?? '',
      legal_entity_ids: legalEntityIds.value.length ? [...legalEntityIds.value] : null,
      contacts: contacts.value.length ? contacts.value.map((contact) => ({ ...contact })) : null,
    })
  }

  function resetExtendedForm(values: ApplicantFormInitialValues) {
    form.resetForm({ values: { ...values } })
    legalEntityIds.value = []
    contacts.value = []
    extraFieldErrors.value = { legal_entity_ids: null, contacts: null }
  }

  function setLegalEntityIds(ids: number[]) {
    legalEntityIds.value = [...ids]
  }

  function setContacts(nextContacts: ApplicantContact[]) {
    contacts.value = nextContacts.map((contact) => ({ ...contact }))
  }

  return {
    ...form,
    title,
    titleAttrs,
    categoryId,
    categoryIdAttrs,
    companyGroup,
    companyGroupAttrs,
    titleModel,
    categoryIdModel,
    companyGroupModel,
    legalEntityIds,
    contacts,
    formErrors,
    applyServerFieldErrors,
    toPayload,
    resetExtendedForm,
    setLegalEntityIds,
    setContacts,
  }
}
