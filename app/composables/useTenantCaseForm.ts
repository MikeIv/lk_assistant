import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type {
  TenantCaseApplicantPayload,
  TenantCaseCreateFieldErrors,
  TenantCaseCreatePayload,
  TenantCaseNegotiation,
} from '#shared/types/tenantCases'
import {
  tenantCaseFormSchema,
  type TenantCaseApplicantFormValues,
} from '#shared/utils/tenantCasesSchema'
import {
  normalizeTenantCaseApplicantPayload,
  toTenantCaseApiDateTime,
  toTenantCaseDateInputValue,
} from '#shared/utils/tenantCasesNormalize'
import { TENANT_CASE_APPLICANT_STATUS_OPTIONS } from '#shared/utils/tenantCasesTable'

const FORM_FIELD_KEYS = ['room_id', 'responsible_name'] as const satisfies ReadonlyArray<
  keyof Pick<TenantCaseCreateFieldErrors, 'room_id' | 'responsible_name'>
>

export interface TenantCaseFormInitialValues {
  room_id: string
  responsible_name: string
}

const EMPTY_FORM_VALUES: TenantCaseFormInitialValues = {
  room_id: '',
  responsible_name: '',
}

function createEmptyApplicant(): TenantCaseApplicantFormValues {
  return {
    tenant_applicant_id: '',
    status: TENANT_CASE_APPLICANT_STATUS_OPTIONS[0],
    first_contact_date: '',
    next_contact_date: '',
    negotiations: [],
  }
}

function createStringFieldModel(field: Ref<string | undefined>) {
  return computed({
    get: () => field.value ?? '',
    set: (value: string) => {
      field.value = value
    },
  })
}

export function useTenantCaseForm(initialValues: TenantCaseFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(tenantCaseFormSchema),
    initialValues: {
      ...initialValues,
      applicants: [createEmptyApplicant()],
    },
  })

  const [roomId, roomIdAttrs] = form.defineField('room_id')
  const [responsibleName, responsibleNameAttrs] = form.defineField('responsible_name')

  const applicants = ref<TenantCaseApplicantFormValues[]>([createEmptyApplicant()])
  const applicantsError = ref<string | null>(null)

  const roomIdModel = createStringFieldModel(roomId)
  const responsibleNameModel = createStringFieldModel(responsibleName)

  function syncApplicantsToForm() {
    form.setFieldValue('applicants', [...applicants.value], true)
  }

  function resolveApplicantsError(): string | null {
    if (applicantsError.value) {
      return applicantsError.value
    }

    for (const [key, message] of Object.entries(form.errors.value)) {
      if (key.startsWith('applicants') && message) {
        return message
      }
    }

    return null
  }

  const formErrors = computed(() => ({
    room_id: form.errors.value.room_id,
    responsible_name: form.errors.value.responsible_name,
    applicants: resolveApplicantsError(),
  }))

  function applyServerFieldErrors(fieldErrors: TenantCaseCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }

    applicantsError.value = fieldErrors.applicants
  }

  function setApplicantsFromPayload(applicantPayloads: TenantCaseApplicantPayload[]) {
    applicants.value = applicantPayloads.map((applicant) => ({
      tenant_applicant_id: String(applicant.tenant_applicant_id),
      status: applicant.status,
      first_contact_date: toTenantCaseDateInputValue(applicant.first_contact_date),
      next_contact_date: toTenantCaseDateInputValue(applicant.next_contact_date),
      negotiations: (applicant.negotiations ?? []).map((item) => ({
        date: toTenantCaseDateInputValue(item.date),
        info: item.info?.trim() ?? '',
      })),
    }))
    form.setFieldValue('applicants', applicants.value)
  }

  function resetApplicants() {
    applicants.value = [createEmptyApplicant()]
    form.setFieldValue('applicants', applicants.value)
    applicantsError.value = null
  }

  function addApplicant() {
    applicants.value.push(createEmptyApplicant())
    form.setFieldValue('applicants', applicants.value)
  }

  function removeApplicant(index: number) {
    if (applicants.value.length <= 1) {
      return
    }

    applicants.value.splice(index, 1)
    form.setFieldValue('applicants', applicants.value)
  }

  function addNegotiation(applicantIndex: number) {
    const applicant = applicants.value[applicantIndex]
    if (!applicant) {
      return
    }

    applicant.negotiations.push({ date: '', info: '' })
    syncApplicantsToForm()
  }

  function removeNegotiation(applicantIndex: number, negotiationIndex: number) {
    const applicant = applicants.value[applicantIndex]
    applicant?.negotiations.splice(negotiationIndex, 1)
    syncApplicantsToForm()
  }

  function toPayload(): TenantCaseCreatePayload {
    return {
      room_id: Number(roomId.value),
      responsible_name: responsibleName.value?.trim() ? responsibleName.value.trim() : null,
      applicants: applicants.value.map((applicant) =>
        normalizeTenantCaseApplicantPayload({
          tenant_applicant_id: Number(applicant.tenant_applicant_id),
          status: applicant.status,
          first_contact_date: toTenantCaseApiDateTime(applicant.first_contact_date),
          next_contact_date: applicant.next_contact_date
            ? toTenantCaseApiDateTime(applicant.next_contact_date)
            : null,
          negotiations: applicant.negotiations.length
            ? applicant.negotiations.map((item) => ({
                date: item.date ? toTenantCaseApiDateTime(item.date) : null,
                info: item.info?.trim() ? item.info.trim() : null,
              }))
            : null,
        }),
      ),
    }
  }

  function createSubmitHandler(callback: () => void | Promise<void>) {
    const validatedSubmit = form.handleSubmit(async () => {
      applicantsError.value = null
      await callback()
    })

    return () => {
      syncApplicantsToForm()
      return validatedSubmit()
    }
  }

  return {
    handleSubmit: createSubmitHandler,
    errors: formErrors,
    resetForm: form.resetForm,
    applyServerFieldErrors,
    toPayload,
    roomId: roomIdModel,
    roomIdAttrs,
    responsibleName: responsibleNameModel,
    responsibleNameAttrs,
    applicants,
    resetApplicants,
    setApplicantsFromPayload,
    addApplicant,
    removeApplicant,
    addNegotiation,
    removeNegotiation,
    statusOptions: TENANT_CASE_APPLICANT_STATUS_OPTIONS,
  }
}

export type { TenantCaseNegotiation }
