import type { PremiseCreateFieldErrors, PremiseCreatePayload } from '#shared/types/premises'
import { premiseFormSchema } from '#shared/utils/premisesSchema'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

function parseOptionalArea(value: string): number | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed.replace(',', '.'))

  return Number.isNaN(parsed) ? null : parsed
}

export function normalizePremiseCreatePayload(payload: PremiseCreatePayload): PremiseCreatePayload {
  return {
    room_type_id: payload.room_type_id,
    name: payload.name.trim(),
    floor: payload.floor?.trim() ? payload.floor.trim() : null,
    area: payload.area,
    name_bti: payload.name_bti?.trim() ? payload.name_bti.trim() : null,
    floor_bti: payload.floor_bti?.trim() ? payload.floor_bti.trim() : null,
    area_bti: payload.area_bti,
  }
}

export function normalizePremiseFormValues(values: {
  room_type_id: string
  name: string
  floor: string
  area: string
  name_bti: string
  floor_bti: string
  area_bti: string
}): PremiseCreatePayload {
  return normalizePremiseCreatePayload({
    room_type_id: Number(values.room_type_id),
    name: values.name,
    floor: values.floor.trim() ? values.floor : null,
    area: parseOptionalArea(values.area),
    name_bti: values.name_bti.trim() ? values.name_bti : null,
    floor_bti: values.floor_bti.trim() ? values.floor_bti : null,
    area_bti: parseOptionalArea(values.area_bti),
  })
}

export function emptyPremiseCreateFieldErrors(): PremiseCreateFieldErrors {
  return {
    room_type_id: null,
    name: null,
    floor: null,
    area: null,
    name_bti: null,
    floor_bti: null,
    area_bti: null,
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

const FORM_FIELD_KEYS = [
  'room_type_id',
  'name',
  'floor',
  'area',
  'name_bti',
  'floor_bti',
  'area_bti',
] as const satisfies ReadonlyArray<keyof PremiseCreateFieldErrors>

export function parsePremiseCreateFieldErrors(data: unknown): PremiseCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyPremiseCreateFieldErrors()
  }

  return {
    room_type_id: firstFieldError(errors, 'room_type_id'),
    name: firstFieldError(errors, 'name'),
    floor: firstFieldError(errors, 'floor'),
    area: firstFieldError(errors, 'area'),
    name_bti: firstFieldError(errors, 'name_bti'),
    floor_bti: firstFieldError(errors, 'floor_bti'),
    area_bti: firstFieldError(errors, 'area_bti'),
  }
}

export function hasPremiseCreateFieldErrors(fieldErrors: PremiseCreateFieldErrors): boolean {
  return FORM_FIELD_KEYS.some((field) => Boolean(fieldErrors[field]))
}

export function validatePremiseFormPayload(
  payload: PremiseCreatePayload,
): PremiseCreateFieldErrors {
  const result = premiseFormSchema.safeParse({
    room_type_id: String(payload.room_type_id || ''),
    name: payload.name,
    floor: payload.floor ?? '',
    area: payload.area === null ? '' : String(payload.area),
    name_bti: payload.name_bti ?? '',
    floor_bti: payload.floor_bti ?? '',
    area_bti: payload.area_bti === null ? '' : String(payload.area_bti),
  })

  const fieldErrors = emptyPremiseCreateFieldErrors()

  if (result.success) {
    return fieldErrors
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (
      typeof field === 'string' &&
      field in fieldErrors &&
      !fieldErrors[field as keyof PremiseCreateFieldErrors]
    ) {
      fieldErrors[field as keyof PremiseCreateFieldErrors] = issue.message
    }
  }

  return fieldErrors
}
