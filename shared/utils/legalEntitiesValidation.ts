import type {
  LegalEntityCreateFieldErrors,
  LegalEntityCreatePayload,
} from '#shared/types/legalEntities'
import { legalEntityFormSchema } from '#shared/utils/legalEntitiesSchema'

export const LEGAL_ENTITY_DUPLICATE_NAME_MESSAGE =
  'юридическое лицо с таким наименованием уже существует'

export const LEGAL_ENTITY_DUPLICATE_INN_MESSAGE = 'юридическое лицо с таким ИНН уже существует'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function normalizeLegalEntityCreatePayload(
  payload: LegalEntityCreatePayload,
): LegalEntityCreatePayload {
  return {
    legal_entity: payload.legal_entity.trim(),
    inn: payload.inn.trim(),
    kpp: payload.kpp?.trim() ? payload.kpp.trim() : null,
  }
}

export function emptyLegalEntityCreateFieldErrors(): LegalEntityCreateFieldErrors {
  return {
    legal_entity: null,
    inn: null,
    kpp: null,
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

export function parseLegalEntityCreateFieldErrors(data: unknown): LegalEntityCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyLegalEntityCreateFieldErrors()
  }

  return {
    legal_entity: firstFieldError(errors, 'legal_entity'),
    inn: firstFieldError(errors, 'inn'),
    kpp: firstFieldError(errors, 'kpp'),
  }
}

export function hasLegalEntityCreateFieldErrors(
  fieldErrors: LegalEntityCreateFieldErrors,
): boolean {
  return Boolean(fieldErrors.legal_entity || fieldErrors.inn || fieldErrors.kpp)
}

export function validateLegalEntityFormPayload(
  payload: LegalEntityCreatePayload,
): LegalEntityCreateFieldErrors {
  const result = legalEntityFormSchema.safeParse({
    legal_entity: payload.legal_entity,
    inn: payload.inn,
    kpp: payload.kpp ?? '',
  })

  const fieldErrors = emptyLegalEntityCreateFieldErrors()

  if (result.success) {
    return fieldErrors
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (field === 'legal_entity' && !fieldErrors.legal_entity) {
      fieldErrors.legal_entity = issue.message
    }

    if (field === 'inn' && !fieldErrors.inn) {
      fieldErrors.inn = issue.message
    }

    if (field === 'kpp' && !fieldErrors.kpp) {
      fieldErrors.kpp = issue.message
    }
  }

  return fieldErrors
}

export function findLegalEntityDuplicateErrors(
  items: Array<{ id?: number; legal_entity: string; inn: string }>,
  payload: { legal_entity: string; inn: string },
  excludeId?: number,
): LegalEntityCreateFieldErrors {
  const fieldErrors = emptyLegalEntityCreateFieldErrors()
  const normalizedName = payload.legal_entity.trim().toLowerCase()
  const normalizedInn = payload.inn.trim()

  const comparableItems =
    excludeId === undefined ? items : items.filter((item) => item.id !== excludeId)

  const hasDuplicateName = comparableItems.some(
    (item) => item.legal_entity.trim().toLowerCase() === normalizedName,
  )
  const hasDuplicateInn = comparableItems.some((item) => item.inn.trim() === normalizedInn)

  if (hasDuplicateName) {
    fieldErrors.legal_entity = LEGAL_ENTITY_DUPLICATE_NAME_MESSAGE
  }

  if (hasDuplicateInn) {
    fieldErrors.inn = LEGAL_ENTITY_DUPLICATE_INN_MESSAGE
  }

  return fieldErrors
}
