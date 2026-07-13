import type {
  TenantCaseCreateFieldErrors,
  TenantCaseCreatePayload,
  TenantCaseStorePayload,
} from '#shared/types/tenantCases'
import { tenantCaseFormSchema } from '#shared/utils/tenantCasesSchema'
import {
  normalizeTenantCaseApplicantPayload,
  toTenantCaseApiDateTime,
} from '#shared/utils/tenantCasesNormalize'

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

export function buildTenantCaseStorePayload(
  payload: TenantCaseCreatePayload,
): TenantCaseStorePayload {
  const [applicant] = payload.applicants
  const [negotiation] = applicant?.negotiations ?? []

  return {
    room_id: payload.room_id,
    responsible_name: payload.responsible_name?.trim() ? payload.responsible_name.trim() : null,
    tenant_applicant_id: applicant?.tenant_applicant_id ?? 0,
    first_contact_date: toTenantCaseApiDateTime(applicant?.first_contact_date ?? ''),
    negotiation_date: toTenantCaseApiDateTime(negotiation?.date ?? ''),
    negotiation_info: negotiation?.info?.trim() ?? '',
  }
}

export function normalizeTenantCaseStorePayload(
  payload: TenantCaseStorePayload,
): TenantCaseStorePayload {
  return {
    room_id: payload.room_id,
    responsible_name: payload.responsible_name?.trim() ? payload.responsible_name.trim() : null,
    tenant_applicant_id: payload.tenant_applicant_id,
    first_contact_date: toTenantCaseApiDateTime(payload.first_contact_date),
    negotiation_date: toTenantCaseApiDateTime(payload.negotiation_date),
    negotiation_info: payload.negotiation_info.trim(),
  }
}

export function storePayloadToCreatePayload(
  payload: TenantCaseStorePayload,
): TenantCaseCreatePayload {
  return {
    room_id: payload.room_id,
    responsible_name: payload.responsible_name,
    applicants: [
      {
        tenant_applicant_id: payload.tenant_applicant_id,
        negotiation_status_id: 1,
        first_contact_date: payload.first_contact_date,
        next_contact_date: null,
        negotiations: [
          {
            date: payload.negotiation_date,
            info: payload.negotiation_info,
          },
        ],
      },
    ],
  }
}

export function emptyTenantCaseCreateFieldErrors(): TenantCaseCreateFieldErrors {
  return {
    room_id: null,
    responsible_name: null,
    tenant_applicant_id: null,
    first_contact_date: null,
    negotiation_date: null,
    negotiation_info: null,
    negotiation_status_id: null,
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
    tenant_applicant_id: firstFieldError(errors, 'tenant_applicant_id'),
    first_contact_date: firstFieldError(errors, 'first_contact_date'),
    negotiation_date: firstFieldError(errors, 'negotiation_date'),
    negotiation_info: firstFieldError(errors, 'negotiation_info'),
    negotiation_status_id:
      firstFieldError(errors, 'negotiation_status_id') ?? firstFieldError(errors, 'status'),
    applicants: firstFieldError(errors, 'applicants') ?? firstApplicantsFieldError(errors),
  }
}

export function hasTenantCaseCreateFieldErrors(fieldErrors: TenantCaseCreateFieldErrors): boolean {
  return Object.values(fieldErrors).some(Boolean)
}

export function validateTenantCaseFormPayload(
  payload: TenantCaseCreatePayload,
): TenantCaseCreateFieldErrors {
  const result = tenantCaseFormSchema.safeParse({
    room_id: String(payload.room_id),
    responsible_name: payload.responsible_name ?? '',
    applicants: payload.applicants.map((applicant) => ({
      id: applicant.id ?? null,
      tenant_applicant_id: String(applicant.tenant_applicant_id),
      negotiation_status_id: String(applicant.negotiation_status_id),
      first_contact_date: applicant.first_contact_date.slice(0, 10),
      next_contact_date: applicant.next_contact_date?.slice(0, 10) ?? '',
      negotiations: (applicant.negotiations ?? []).map((item) => ({
        date: item.date?.slice(0, 10) ?? '',
        info: item.info ?? '',
      })),
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

    if (field === 'applicants') {
      const applicantIndex = issue.path[1]
      const applicantField = issue.path[2]

      // Array-level (min length) — only bag error for create UI.
      if (typeof applicantIndex !== 'number') {
        if (!fieldErrors.applicants) {
          fieldErrors.applicants = issue.message
        }
        continue
      }

      if (applicantIndex === 0 && typeof applicantField === 'string') {
        if (applicantField === 'tenant_applicant_id' && !fieldErrors.tenant_applicant_id) {
          fieldErrors.tenant_applicant_id = issue.message
        } else if (
          applicantField === 'negotiation_status_id' &&
          !fieldErrors.negotiation_status_id
        ) {
          fieldErrors.negotiation_status_id = issue.message
        } else if (applicantField === 'first_contact_date' && !fieldErrors.first_contact_date) {
          fieldErrors.first_contact_date = issue.message
        } else if (applicantField === 'negotiations') {
          const negotiationField = issue.path[4]

          if (negotiationField === 'date' && !fieldErrors.negotiation_date) {
            fieldErrors.negotiation_date = issue.message
          } else if (negotiationField === 'info' && !fieldErrors.negotiation_info) {
            fieldErrors.negotiation_info = issue.message
          }
        }
        continue
      }

      // Nested errors for applicants[1+] — bag until card fieldErrors land.
      if (!fieldErrors.applicants) {
        fieldErrors.applicants = issue.message
      }
    }
  }

  return fieldErrors
}
