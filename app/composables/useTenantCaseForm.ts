import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type {
  TenantCaseApplicantPayload,
  TenantCaseCreateFieldErrors,
  TenantCaseCreatePayload,
  TenantCaseNegotiation,
  TenantCaseStorePayload,
} from '#shared/types/tenantCases'
import {
  tenantCaseFormSchema,
  type TenantCaseApplicantFormValues,
  type TenantCaseFormValues,
} from '#shared/utils/tenantCasesSchema'
import {
  getTenantCaseTodayDateInputValue,
  normalizeTenantCaseApplicantPayload,
  toTenantCaseDateInputValue,
} from '#shared/utils/tenantCasesNormalize'
import {
  buildTenantCaseStorePayload,
  validateTenantCaseFormValuesFieldPaths,
} from '#shared/utils/tenantCasesValidation'

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
    id: null,
    tenant_applicant_id: '',
    tenant_applicant: '',
    category: '',
    status: '',
    negotiation_status_id: '',
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

function fieldPathVariants(path: string): string[] {
  const dotToBracket = path.replace(/\.(\d+)(?=\.|$)/g, '[$1]')
  const bracketToDot = path.replace(/\[(\d+)\]/g, '.$1')

  return [...new Set([path, dotToBracket, bracketToDot])]
}

function resolveNestedFieldError(
  errors: Partial<Record<string, string | undefined>>,
  path: string,
): string | undefined {
  for (const variant of fieldPathVariants(path)) {
    const message = errors[variant]

    if (message) {
      return message
    }
  }

  return undefined
}

function mapApplicantFromPayload(
  applicantPayload: TenantCaseApplicantPayload & {
    tenant_applicant?: string
    category?: string
    status?: string
  },
): TenantCaseApplicantFormValues {
  const negotiations = (applicantPayload.negotiations ?? []).map((item) => ({
    date: toTenantCaseDateInputValue(item.date) || getTenantCaseTodayDateInputValue(),
    info: item.info?.trim() ?? '',
  }))

  return {
    id: applicantPayload.id ?? null,
    tenant_applicant_id: String(applicantPayload.tenant_applicant_id),
    tenant_applicant: applicantPayload.tenant_applicant ?? '',
    category: applicantPayload.category ?? '',
    status: applicantPayload.status ?? '',
    negotiation_status_id: String(applicantPayload.negotiation_status_id),
    first_contact_date:
      toTenantCaseDateInputValue(applicantPayload.first_contact_date) ||
      getTenantCaseTodayDateInputValue(),
    next_contact_date: toTenantCaseDateInputValue(applicantPayload.next_contact_date),
    negotiations: negotiations.length > 0 ? negotiations : [createEmptyNegotiation()],
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

    return resolveNestedFieldError(errors, path)
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

  /** Flat errors for create UI (applicants[0]); card UI uses `getFieldError`. */
  const formErrors = computed(() => ({
    room_id: resolveVisibleFieldError('room_id'),
    tenant_applicant_id: resolveVisibleFieldError('applicants.0.tenant_applicant_id'),
    negotiation_status_id: resolveVisibleFieldError('applicants.0.negotiation_status_id'),
    first_contact_date: resolveVisibleFieldError('applicants.0.first_contact_date'),
    negotiation_date: resolveVisibleFieldError('applicants.0.negotiations.0.date'),
    negotiation_info: resolveVisibleFieldError('applicants.0.negotiations.0.info'),
    applicants: resolveApplicantsError(),
  }))

  const APPLICANT_SERVER_ERROR_MAP = {
    tenant_applicant_id: 'applicants[0].tenant_applicant_id',
    first_contact_date: 'applicants[0].first_contact_date',
    negotiation_status_id: 'applicants[0].negotiation_status_id',
    negotiation_date: 'applicants[0].negotiations[0].date',
    negotiation_info: 'applicants[0].negotiations[0].info',
  } as const satisfies Record<
    Exclude<keyof TenantCaseCreateFieldErrors, 'room_id' | 'responsible_name' | 'applicants'>,
    `applicants[${number}].${string}`
  >

  function firstApplicantFieldErrorMessage(fieldPaths: Record<string, string>): string | null {
    return Object.entries(fieldPaths).find(([path]) => path.startsWith('applicants'))?.[1] ?? null
  }

  function applyValidationFieldPaths(fieldPaths: Record<string, string>) {
    showValidationErrors.value = true

    for (const [path, message] of Object.entries(fieldPaths)) {
      form.setFieldError(path as Parameters<typeof form.setFieldError>[0], message)
    }
  }

  function applyFormValuesValidationFieldPaths(): Record<string, string> {
    syncApplicantsToForm()
    const fieldPaths = validateTenantCaseFormValuesFieldPaths(form.values as TenantCaseFormValues)
    applyValidationFieldPaths(fieldPaths)

    return fieldPaths
  }

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

  function applyMutationFieldErrors(
    fieldErrors: TenantCaseCreateFieldErrors,
    _payload: TenantCaseCreatePayload,
  ) {
    applyServerFieldErrors(fieldErrors)
    const fieldPaths = applyFormValuesValidationFieldPaths()

    if (!applicantsError.value) {
      applicantsError.value = firstApplicantFieldErrorMessage(fieldPaths)
    }
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
    applicantPayloads: Array<
      TenantCaseApplicantPayload & {
        tenant_applicant?: string
        category?: string
        status?: string
      }
    >,
  ) {
    applicants.value =
      applicantPayloads.length > 0
        ? applicantPayloads.map(mapApplicantFromPayload)
        : [createEmptyApplicant()]
    clearValidationState()
    form.resetForm({
      values: {
        ...values,
        applicants: applicants.value,
      },
    })
  }

  function addApplicant() {
    applicants.value = [...applicants.value, createEmptyApplicant()]
    syncApplicantsToForm()
  }

  function removeApplicant(index: number) {
    if (applicants.value.length <= 1) {
      return
    }

    applicants.value = applicants.value.filter((_, applicantIndex) => applicantIndex !== index)
    syncApplicantsToForm()
  }

  function addNegotiation(applicantIndex: number) {
    const applicant = applicants.value[applicantIndex]

    if (!applicant) {
      return
    }

    const nextApplicants = [...applicants.value]
    nextApplicants[applicantIndex] = {
      ...applicant,
      negotiations: [...applicant.negotiations, createEmptyNegotiation()],
    }
    applicants.value = nextApplicants
    syncApplicantsToForm()
  }

  function removeNegotiation(applicantIndex: number, negotiationIndex: number) {
    if (negotiationIndex === 0) {
      return
    }

    const applicant = applicants.value[applicantIndex]

    if (!applicant || applicant.negotiations.length <= 1) {
      return
    }

    const nextApplicants = [...applicants.value]
    nextApplicants[applicantIndex] = {
      ...applicant,
      negotiations: applicant.negotiations.filter((_, index) => index !== negotiationIndex),
    }
    applicants.value = nextApplicants
    syncApplicantsToForm()
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
          id: applicant.id ?? null,
          tenant_applicant_id: Number(applicant.tenant_applicant_id),
          negotiation_status_id: Number(applicant.negotiation_status_id),
          first_contact_date: applicant.first_contact_date,
          next_contact_date: applicant.next_contact_date.trim() || null,
          negotiations: applicant.negotiations.map((item) => ({
            date: item.date,
            info: item.info?.trim() ? item.info.trim() : null,
          })),
        }),
      ),
    }
  }

  function createSubmitHandler(
    callback: () => void | Promise<void>,
    options?: { onInvalid?: () => void },
  ) {
    return async () => {
      showValidationErrors.value = true
      const fieldPaths = applyFormValuesValidationFieldPaths()

      if (Object.keys(fieldPaths).length > 0) {
        applicantsError.value =
          firstApplicantFieldErrorMessage(fieldPaths) ?? 'Проверьте данные претендентов'

        options?.onInvalid?.()
        return false
      }

      applicantsError.value = null

      await callback()
      return true
    }
  }

  return {
    handleSubmit: createSubmitHandler,
    errors: formErrors,
    getFieldError: resolveVisibleFieldError,
    applicantsError: computed(() => applicantsError.value),
    resetTenantCaseForm,
    loadTenantCaseForm,
    applyServerFieldErrors,
    applyMutationFieldErrors,
    addApplicant,
    removeApplicant,
    addNegotiation,
    removeNegotiation,
    toPayload,
    toStorePayload,
    roomId: roomIdModel,
    applicants,
  }
}

export type { TenantCaseNegotiation }
