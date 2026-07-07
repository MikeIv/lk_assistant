import type {
  ApplicantContact,
  ApplicantCreateFieldErrors,
  ApplicantCreatePayload,
} from '#shared/types/applicants'
import { applicantContactFormSchema, applicantFormSchema } from '#shared/utils/applicantsSchema'
import { APPLICANTS_MAX_LEGAL_ENTITIES } from '#shared/utils/applicantsTable'
import { normalizeRussianPhoneValue } from '#shared/utils/russianPhone'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function normalizeApplicantContact(contact: ApplicantContact): ApplicantContact | null {
  const normalized: ApplicantContact = {
    name: contact.name?.trim() ? contact.name.trim() : null,
    position: contact.position?.trim() ? contact.position.trim() : null,
    phone_number: normalizeRussianPhoneValue(contact.phone_number),
    email: contact.email?.trim() ? contact.email.trim() : null,
  }

  if (!normalized.name && !normalized.position && !normalized.phone_number && !normalized.email) {
    return null
  }

  return normalized
}

export function normalizeApplicantCreatePayload(
  payload: ApplicantCreatePayload,
): ApplicantCreatePayload {
  const contacts = (payload.contacts ?? [])
    .map(normalizeApplicantContact)
    .filter((contact): contact is ApplicantContact => contact !== null)

  const legalEntityIds = payload.legal_entity_ids?.length ? [...payload.legal_entity_ids] : null

  return {
    title: payload.title.trim(),
    category_id: payload.category_id,
    company_group: payload.company_group?.trim() ? payload.company_group.trim() : null,
    legal_entity_ids: legalEntityIds,
    contacts: contacts.length ? contacts : null,
  }
}

export function emptyApplicantCreateFieldErrors(): ApplicantCreateFieldErrors {
  return {
    title: null,
    category_id: null,
    company_group: null,
    legal_entity_ids: null,
    contacts: null,
    contact_emails: [],
    contact_phones: [],
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

function parseContactFieldErrors(
  errors: Record<string, string[]>,
  field: 'email' | 'phone_number',
): (string | null)[] {
  const contactFieldErrors: (string | null)[] = []
  const pattern = new RegExp(`^contacts(?:\\.(\\d+)\\.${field}|\\[(\\d+)\\]\\.${field})$`)

  for (const [key, messages] of Object.entries(errors)) {
    const match = key.match(pattern)
    if (!match) {
      continue
    }

    const index = Number(match[1] ?? match[2])
    if (!Number.isFinite(index)) {
      continue
    }

    contactFieldErrors[index] = messages?.[0] ?? null
  }

  return contactFieldErrors
}

export function parseApplicantCreateFieldErrors(data: unknown): ApplicantCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyApplicantCreateFieldErrors()
  }

  return {
    title: firstFieldError(errors, 'title'),
    category_id: firstFieldError(errors, 'category_id'),
    company_group: firstFieldError(errors, 'company_group'),
    legal_entity_ids: firstFieldError(errors, 'legal_entity_ids'),
    contacts: firstFieldError(errors, 'contacts'),
    contact_emails: parseContactFieldErrors(errors, 'email'),
    contact_phones: parseContactFieldErrors(errors, 'phone_number'),
  }
}

export function hasApplicantCreateFieldErrors(fieldErrors: ApplicantCreateFieldErrors): boolean {
  return Boolean(
    fieldErrors.title ||
    fieldErrors.category_id ||
    fieldErrors.company_group ||
    fieldErrors.legal_entity_ids ||
    fieldErrors.contacts ||
    fieldErrors.contact_emails.some(Boolean) ||
    fieldErrors.contact_phones.some(Boolean),
  )
}

export function validateApplicantContactFieldErrors(
  contacts: ApplicantContact[] | null,
  field: 'email' | 'phone_number',
): (string | null)[] {
  if (!contacts?.length) {
    return []
  }

  const schema = applicantContactFormSchema.shape[field]

  return contacts.map((contact) => {
    const result = schema.safeParse(contact[field])
    return result.success ? null : (result.error.issues[0]?.message ?? null)
  })
}

export function validateApplicantContactEmails(
  contacts: ApplicantContact[] | null,
): (string | null)[] {
  return validateApplicantContactFieldErrors(contacts, 'email')
}

export function validateApplicantContactPhones(
  contacts: ApplicantContact[] | null,
): (string | null)[] {
  return validateApplicantContactFieldErrors(contacts, 'phone_number')
}

export function validateApplicantFormPayload(
  payload: ApplicantCreatePayload,
): ApplicantCreateFieldErrors {
  const result = applicantFormSchema.safeParse({
    title: payload.title,
    category_id: payload.category_id > 0 ? String(payload.category_id) : '',
    company_group: payload.company_group ?? '',
  })

  const fieldErrors = emptyApplicantCreateFieldErrors()

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (field === 'title' && !fieldErrors.title) {
        fieldErrors.title = issue.message
      }

      if (field === 'category_id' && !fieldErrors.category_id) {
        fieldErrors.category_id = issue.message
      }

      if (field === 'company_group' && !fieldErrors.company_group) {
        fieldErrors.company_group = issue.message
      }
    }
  }

  if (payload.legal_entity_ids && payload.legal_entity_ids.length > APPLICANTS_MAX_LEGAL_ENTITIES) {
    fieldErrors.legal_entity_ids = `Не более ${APPLICANTS_MAX_LEGAL_ENTITIES} юридических лиц`
  }

  fieldErrors.contact_emails = validateApplicantContactEmails(payload.contacts)
  fieldErrors.contact_phones = validateApplicantContactPhones(payload.contacts)

  return fieldErrors
}

export function createEmptyApplicantContact(): ApplicantContact {
  return {
    name: null,
    position: null,
    phone_number: null,
    email: null,
  }
}
