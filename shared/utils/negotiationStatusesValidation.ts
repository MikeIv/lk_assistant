import type {
  NegotiationStatusCreateFieldErrors,
  NegotiationStatusCreatePayload,
} from '#shared/types/negotiationStatuses'
import { negotiationStatusFormSchema } from '#shared/utils/negotiationStatusesSchema'

export const NEGOTIATION_STATUS_DUPLICATE_NAME_MESSAGE =
  'статус переговоров с таким наименованием уже существует'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function normalizeNegotiationStatusCreatePayload(
  payload: NegotiationStatusCreatePayload,
): NegotiationStatusCreatePayload {
  return {
    name: payload.name.trim(),
  }
}

export function emptyNegotiationStatusCreateFieldErrors(): NegotiationStatusCreateFieldErrors {
  return {
    name: null,
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

export function parseNegotiationStatusCreateFieldErrors(
  data: unknown,
): NegotiationStatusCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyNegotiationStatusCreateFieldErrors()
  }

  return {
    name: firstFieldError(errors, 'name'),
  }
}

export function hasNegotiationStatusCreateFieldErrors(
  fieldErrors: NegotiationStatusCreateFieldErrors,
): boolean {
  return Boolean(fieldErrors.name)
}

export function validateNegotiationStatusFormPayload(
  payload: NegotiationStatusCreatePayload,
): NegotiationStatusCreateFieldErrors {
  const result = negotiationStatusFormSchema.safeParse({
    name: payload.name,
  })

  const fieldErrors = emptyNegotiationStatusCreateFieldErrors()

  if (result.success) {
    return fieldErrors
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (field === 'name' && !fieldErrors.name) {
      fieldErrors.name = issue.message
    }
  }

  return fieldErrors
}

export function findNegotiationStatusDuplicateErrors(
  items: Array<{ id?: number; name: string }>,
  payload: { name: string },
  excludeId?: number,
): NegotiationStatusCreateFieldErrors {
  const fieldErrors = emptyNegotiationStatusCreateFieldErrors()
  const normalizedName = payload.name.trim().toLowerCase()

  const comparableItems =
    excludeId === undefined ? items : items.filter((item) => item.id !== excludeId)

  const hasDuplicateName = comparableItems.some(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  )

  if (hasDuplicateName) {
    fieldErrors.name = NEGOTIATION_STATUS_DUPLICATE_NAME_MESSAGE
  }

  return fieldErrors
}
