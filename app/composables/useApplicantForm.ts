import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { Ref } from 'vue'

import type {
  ApplicantContact,
  ApplicantCreateFieldErrors,
  ApplicantCreatePayload,
} from '#shared/types/applicants'
import {
  applicantContactFormSchema,
  applicantExtendedFormSchema,
} from '#shared/utils/applicantsSchema'
import { normalizeApplicantCreatePayload } from '#shared/utils/applicantsValidation'

const FORM_FIELD_KEYS = ['title', 'category_id', 'company_group'] as const satisfies ReadonlyArray<
  keyof ApplicantCreateFieldErrors
>

const CONTACT_FIELD_PATTERN = /^contacts(?:\[(\d+)\]|\.(\d+))\.(email|phone_number)$/

function contactFieldPath(index: number, field: 'email' | 'phone_number') {
  return `contacts[${index}].${field}` as `contacts[${number}].${typeof field}`
}

function getContactFieldError(
  formErrors: Partial<Record<string, string | undefined>>,
  index: number,
  field: 'email' | 'phone_number',
): string | undefined {
  const bracketPath = contactFieldPath(index, field)
  const dotPath = `contacts.${index}.${field}`

  return formErrors[bracketPath] ?? formErrors[dotPath]
}

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

function resolveContactFieldErrors(
  formErrors: Partial<Record<string, string | undefined>>,
  field: 'email' | 'phone_number',
): (string | null)[] {
  const errors: (string | null)[] = []

  for (const [key, message] of Object.entries(formErrors)) {
    const match = key.match(CONTACT_FIELD_PATTERN)
    if (!match || match[3] !== field || !message) {
      continue
    }

    errors[Number(match[1] ?? match[2])] = message
  }

  return errors
}

function clearContactFieldErrors(form: ReturnType<typeof useForm>) {
  for (const key of Object.keys(form.errors.value)) {
    if (key.startsWith('contacts[') || key.startsWith('contacts.')) {
      form.setFieldError(key, undefined)
    }
  }
}

export function useApplicantForm(initialValues: ApplicantFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(applicantExtendedFormSchema),
    initialValues: { ...initialValues, contacts: [] },
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
    contact_emails: resolveContactFieldErrors(form.errors.value, 'email'),
    contact_phones: resolveContactFieldErrors(form.errors.value, 'phone_number'),
  }))

  function syncContactsToForm(shouldValidate = false) {
    form.setFieldValue(
      'contacts',
      contacts.value.map((contact) => ({ ...contact })),
      shouldValidate,
    )
  }

  function applyServerFieldErrors(fieldErrors: ApplicantCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }

    fieldErrors.contact_emails.forEach((message, index) => {
      if (message) {
        form.setFieldError(contactFieldPath(index, 'email'), message)
      }
    })

    fieldErrors.contact_phones.forEach((message, index) => {
      if (message) {
        form.setFieldError(contactFieldPath(index, 'phone_number'), message)
      }
    })

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
    form.resetForm({ values: { ...values, contacts: [] } })
    legalEntityIds.value = []
    contacts.value = []
    extraFieldErrors.value = { legal_entity_ids: null, contacts: null }
  }

  watch(
    contacts,
    (newContacts, oldContacts) => {
      if (newContacts.length !== oldContacts?.length) {
        clearContactFieldErrors(form)
      }

      syncContactsToForm()

      newContacts.forEach((contact, index) => {
        const oldContact = oldContacts?.[index]

        if (
          oldContact?.email !== contact.email &&
          getContactFieldError(form.errors.value, index, 'email')
        ) {
          validateContactFieldOnBlur(index, 'email')
        }

        if (
          oldContact?.phone_number !== contact.phone_number &&
          getContactFieldError(form.errors.value, index, 'phone_number')
        ) {
          validateContactFieldOnBlur(index, 'phone_number')
        }
      })
    },
    { deep: true },
  )

  function validateContactFieldOnBlur(index: number, field: 'email' | 'phone_number') {
    syncContactsToForm()

    const contact = contacts.value[index]
    if (!contact) {
      return
    }

    const path = contactFieldPath(index, field)
    const result = applicantContactFormSchema.shape[field].safeParse(contact[field])

    if (result.success) {
      form.setFieldError(path, undefined)
      return
    }

    form.setFieldError(path, result.error.issues[0]?.message ?? '')
  }

  function validateContactEmailOnBlur(index: number) {
    validateContactFieldOnBlur(index, 'email')
  }

  function validateContactPhoneOnBlur(index: number) {
    validateContactFieldOnBlur(index, 'phone_number')
  }

  function setLegalEntityIds(ids: number[]) {
    legalEntityIds.value = [...ids]
  }

  function setContacts(nextContacts: ApplicantContact[]) {
    contacts.value = nextContacts.map((contact) => ({ ...contact }))
    syncContactsToForm()
  }

  function createSubmitHandler(callback: () => void | Promise<void>) {
    const validatedSubmit = form.handleSubmit(async () => {
      await callback()
    })

    return () => {
      syncContactsToForm()
      return validatedSubmit()
    }
  }

  return {
    ...form,
    handleSubmit: createSubmitHandler,
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
    validateContactEmailOnBlur,
    validateContactPhoneOnBlur,
  }
}
