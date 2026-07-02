import type { RoomTypeCreateFieldErrors, RoomTypeCreatePayload } from '#shared/types/roomTypes'
import { roomTypeFormSchema } from '#shared/utils/roomTypesSchema'

export const ROOM_TYPE_DUPLICATE_NAME_MESSAGE = 'тип помещения с таким наименованием уже существует'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function normalizeRoomTypeCreatePayload(
  payload: RoomTypeCreatePayload,
): RoomTypeCreatePayload {
  return {
    name: payload.name.trim(),
  }
}

export function emptyRoomTypeCreateFieldErrors(): RoomTypeCreateFieldErrors {
  return {
    name: null,
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

export function parseRoomTypeCreateFieldErrors(data: unknown): RoomTypeCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyRoomTypeCreateFieldErrors()
  }

  return {
    name: firstFieldError(errors, 'name'),
  }
}

export function hasRoomTypeCreateFieldErrors(fieldErrors: RoomTypeCreateFieldErrors): boolean {
  return Boolean(fieldErrors.name)
}

export function validateRoomTypeFormPayload(
  payload: RoomTypeCreatePayload,
): RoomTypeCreateFieldErrors {
  const result = roomTypeFormSchema.safeParse({
    name: payload.name,
  })

  const fieldErrors = emptyRoomTypeCreateFieldErrors()

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

export function findRoomTypeDuplicateErrors(
  items: Array<{ id?: number; name: string }>,
  payload: { name: string },
  excludeId?: number,
): RoomTypeCreateFieldErrors {
  const fieldErrors = emptyRoomTypeCreateFieldErrors()
  const normalizedName = payload.name.trim().toLowerCase()

  const comparableItems =
    excludeId === undefined ? items : items.filter((item) => item.id !== excludeId)

  const hasDuplicateName = comparableItems.some(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  )

  if (hasDuplicateName) {
    fieldErrors.name = ROOM_TYPE_DUPLICATE_NAME_MESSAGE
  }

  return fieldErrors
}
