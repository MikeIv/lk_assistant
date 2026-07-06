import type {
  TenantCaseCreateFieldErrors,
  TenantCaseCreatePayload,
} from '#shared/types/tenantCases'
import { tenantCaseFormSchema } from '#shared/utils/tenantCasesSchema'
import { normalizeTenantCaseApplicantPayload } from '#shared/utils/tenantCasesNormalize'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function normalizeTenantCaseCreatePayload(
  payload: TenantCaseCreatePayload,
): TenantCaseCreatePayload {
  return {
    room_id: payload.room_id,
    responsible_name: payload.responsible_name?.trim() ? payload.responsible_name.trim() : null,
    applicants: payload.applicants.map(normalizeTenantCaseApplicantPayload),
  }
}

export function emptyTenantCaseCreateFieldErrors(): TenantCaseCreateFieldErrors {
  return {
    room_id: null,
    responsible_name: null,
    applicants: null,
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

function firstApplicantsFieldError(errors: Record<string, string[]>): string | null {
  const applicantKey = Object.keys(errors).find((key) => key.startsWith('applicants'))

  if (!applicantKey) {
    return null
  }

  return errors[applicantKey]?.[0] ?? null
}

export function parseTenantCaseCreateFieldErrors(data: unknown): TenantCaseCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyTenantCaseCreateFieldErrors()
  }

  return {
    room_id: firstFieldError(errors, 'room_id'),
    responsible_name: firstFieldError(errors, 'responsible_name'),
    applicants: firstFieldError(errors, 'applicants') ?? firstApplicantsFieldError(errors),
  }
}

export function hasTenantCaseCreateFieldErrors(fieldErrors: TenantCaseCreateFieldErrors): boolean {
  return Boolean(fieldErrors.room_id || fieldErrors.responsible_name || fieldErrors.applicants)
}

export function validateTenantCaseFormPayload(
  payload: TenantCaseCreatePayload,
): TenantCaseCreateFieldErrors {
  const result = tenantCaseFormSchema.safeParse({
    room_id: String(payload.room_id),
    responsible_name: payload.responsible_name ?? '',
    applicants: payload.applicants.map((applicant) => ({
      tenant_applicant_id: String(applicant.tenant_applicant_id),
      status: applicant.status,
      first_contact_date: applicant.first_contact_date.slice(0, 10),
      next_contact_date: applicant.next_contact_date?.slice(0, 10) ?? '',
      negotiations: applicant.negotiations ?? [],
    })),
  })

  const fieldErrors = emptyTenantCaseCreateFieldErrors()

  if (result.success) {
    return fieldErrors
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (field === 'room_id' && !fieldErrors.room_id) {
      fieldErrors.room_id = issue.message
    }

    if (field === 'responsible_name' && !fieldErrors.responsible_name) {
      fieldErrors.responsible_name = issue.message
    }

    if (field === 'applicants' && !fieldErrors.applicants) {
      fieldErrors.applicants = issue.message
    }
  }

  return fieldErrors
}
