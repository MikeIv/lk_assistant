import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type {
  TenantCaseApplicantPayload,
  TenantCaseApplicantStatus,
  TenantCaseCreateFieldErrors,
  TenantCaseCreatePayload,
  TenantCaseNegotiation,
  TenantCaseStorePayload,
} from '#shared/types/tenantCases'
import {
  tenantCaseFormSchema,
  type TenantCaseApplicantFormValues,
} from '#shared/utils/tenantCasesSchema'
import {
  getTenantCaseTodayDateInputValue,
  normalizeTenantCaseApplicantPayload,
  toTenantCaseApiDateTime,
  toTenantCaseDateInputValue,
} from '#shared/utils/tenantCasesNormalize'
import { buildTenantCaseStorePayload } from '#shared/utils/tenantCasesValidation'

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

function createEmptyNegotiation(): TenantCaseApplicantFormValues['negotiations'][number] {
  const today = getTenantCaseTodayDateInputValue()

  return {
    date: today,
    info: '',
  }
}

function createEmptyApplicant(): TenantCaseApplicantFormValues {
  const today = getTenantCaseTodayDateInputValue()

  return {
    tenant_applicant_id: '',
    status: '',
    first_contact_date: today,
    next_contact_date: '',
    negotiations: [createEmptyNegotiation()],
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

function resolveNestedFieldError(
  errors: Partial<Record<string, string | undefined>>,
  path: string,
): string | undefined {
  if (errors[path]) {
    return errors[path]
  }

  const bracketPath = path.replace(/\.(\d+)\./g, '[$1].').replace(/\.(\d+)$/, '[$1]')

  return errors[bracketPath]
}

function mapApplicantFromPayload(
  applicantPayload: TenantCaseApplicantPayload,
): TenantCaseApplicantFormValues {
  const negotiations = (applicantPayload.negotiations ?? []).map((item) => ({
    date: toTenantCaseDateInputValue(item.date) || getTenantCaseTodayDateInputValue(),
    info: item.info?.trim() ?? '',
  }))

  return {
    tenant_applicant_id: String(applicantPayload.tenant_applicant_id),
    status: applicantPayload.status,
    first_contact_date:
      toTenantCaseDateInputValue(applicantPayload.first_contact_date) ||
      getTenantCaseTodayDateInputValue(),
    next_contact_date: '',
    negotiations: negotiations.length > 0 ? [negotiations[0]!] : [createEmptyNegotiation()],
  }
}

export function useTenantCaseForm(initialValues: TenantCaseFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(tenantCaseFormSchema),
    initialValues: {
      ...initialValues,
      applicants: [createEmptyApplicant()],
    },
    validateOnMount: false,
  })

  const [roomId] = form.defineField('room_id')
  const [responsibleName] = form.defineField('responsible_name')

  const applicants = ref<TenantCaseApplicantFormValues[]>([createEmptyApplicant()])
  const applicantsError = ref<string | null>(null)
  const showValidationErrors = ref(false)

  const roomIdModel = createStringFieldModel(roomId)

  function syncApplicantsToForm() {
    form.setFieldValue('applicants', [...applicants.value], false)
  }

  function clearValidationState() {
    applicantsError.value = null
    showValidationErrors.value = false
  }

  function resolveVisibleFieldError(path: string): string | undefined {
    if (!showValidationErrors.value && !applicantsError.value) {
      return undefined
    }

    const errors = form.errors.value as Partial<Record<string, string | undefined>>

    return resolveNestedFieldError(errors, path) ?? errors[path]
  }

  function resolveApplicantsError(): string | null {
    if (applicantsError.value) {
      return applicantsError.value
    }

    if (!showValidationErrors.value) {
      return null
    }

    for (const [key, message] of Object.entries(form.errors.value)) {
      if (key.startsWith('applicants') && message) {
        return message
      }
    }

    return null
  }

  const formErrors = computed(() => ({
    room_id: resolveVisibleFieldError('room_id'),
    tenant_applicant_id: resolveVisibleFieldError('applicants.0.tenant_applicant_id'),
    status: resolveVisibleFieldError('applicants.0.status'),
    first_contact_date: resolveVisibleFieldError('applicants.0.first_contact_date'),
    negotiation_date: resolveVisibleFieldError('applicants.0.negotiations.0.date'),
    negotiation_info: resolveVisibleFieldError('applicants.0.negotiations.0.info'),
    applicants: resolveApplicantsError(),
  }))

  const APPLICANT_SERVER_ERROR_MAP = {
    tenant_applicant_id: 'applicants[0].tenant_applicant_id',
    first_contact_date: 'applicants[0].first_contact_date',
    status: 'applicants[0].status',
    negotiation_date: 'applicants[0].negotiations[0].date',
    negotiation_info: 'applicants[0].negotiations[0].info',
  } as const satisfies Record<
    Exclude<keyof TenantCaseCreateFieldErrors, 'room_id' | 'responsible_name' | 'applicants'>,
    `applicants[${number}].${string}`
  >

  function applyServerFieldErrors(fieldErrors: TenantCaseCreateFieldErrors) {
    showValidationErrors.value = true

    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }

    for (const [errorKey, formPath] of Object.entries(APPLICANT_SERVER_ERROR_MAP)) {
      const message = fieldErrors[errorKey as keyof typeof APPLICANT_SERVER_ERROR_MAP]
      if (message) {
        form.setFieldError(formPath, message)
      }
    }

    applicantsError.value = fieldErrors.applicants
  }

  function resetTenantCaseForm(values: TenantCaseFormInitialValues = EMPTY_FORM_VALUES) {
    applicants.value = [createEmptyApplicant()]
    clearValidationState()
    form.resetForm({
      values: {
        ...values,
        applicants: applicants.value,
      },
    })
  }

  function loadTenantCaseForm(
    values: TenantCaseFormInitialValues,
    applicantPayloads: TenantCaseApplicantPayload[],
  ) {
    const [firstApplicant] = applicantPayloads

    applicants.value = firstApplicant
      ? [mapApplicantFromPayload(firstApplicant)]
      : [createEmptyApplicant()]
    clearValidationState()
    form.resetForm({
      values: {
        ...values,
        applicants: applicants.value,
      },
    })
  }

  function toStorePayload(): TenantCaseStorePayload {
    return buildTenantCaseStorePayload(toPayload())
  }

  function toPayload(): TenantCaseCreatePayload {
    return {
      room_id: Number(roomId.value),
      responsible_name: responsibleName.value?.trim() ? responsibleName.value.trim() : null,
      applicants: applicants.value.map((applicant) =>
        normalizeTenantCaseApplicantPayload({
          tenant_applicant_id: Number(applicant.tenant_applicant_id),
          status: applicant.status as TenantCaseApplicantStatus,
          first_contact_date: toTenantCaseApiDateTime(applicant.first_contact_date),
          next_contact_date: null,
          negotiations: applicant.negotiations.map((item) => ({
            date: toTenantCaseApiDateTime(item.date),
            info: item.info?.trim() ? item.info.trim() : null,
          })),
        }),
      ),
    }
  }

  function createSubmitHandler(callback: () => void | Promise<void>) {
    return () => {
      syncApplicantsToForm()

      return form.handleSubmit(
        async () => {
          applicantsError.value = null
          clearValidationState()
          await callback()
        },
        () => {
          showValidationErrors.value = true
        },
      )()
    }
  }

  return {
    handleSubmit: createSubmitHandler,
    errors: formErrors,
    resetTenantCaseForm,
    loadTenantCaseForm,
    applyServerFieldErrors,
    toPayload,
    toStorePayload,
    roomId: roomIdModel,
    applicants,
  }
}

export type { TenantCaseNegotiation }
