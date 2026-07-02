import type { CategoryCreateFieldErrors, CategoryCreatePayload } from '#shared/types/categories'
import { categoryFormSchema } from '#shared/utils/categoriesSchema'

export const CATEGORY_DUPLICATE_NAME_MESSAGE = 'категория с таким наименованием уже существует'

interface ApiValidationErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}

export function normalizeCategoryCreatePayload(
  payload: CategoryCreatePayload,
): CategoryCreatePayload {
  return {
    name: payload.name.trim(),
  }
}

export function emptyCategoryCreateFieldErrors(): CategoryCreateFieldErrors {
  return {
    name: null,
  }
}

function firstFieldError(errors: Record<string, string[]>, field: string): string | null {
  const messages = errors[field]
  return messages?.[0] ?? null
}

export function parseCategoryCreateFieldErrors(data: unknown): CategoryCreateFieldErrors {
  const payload = data as ApiValidationErrorResponse
  const errors = payload.errors

  if (!errors || typeof errors !== 'object') {
    return emptyCategoryCreateFieldErrors()
  }

  return {
    name: firstFieldError(errors, 'name'),
  }
}

export function hasCategoryCreateFieldErrors(fieldErrors: CategoryCreateFieldErrors): boolean {
  return Boolean(fieldErrors.name)
}

export function validateCategoryFormPayload(
  payload: CategoryCreatePayload,
): CategoryCreateFieldErrors {
  const result = categoryFormSchema.safeParse({
    name: payload.name,
  })

  const fieldErrors = emptyCategoryCreateFieldErrors()

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

export function findCategoryDuplicateErrors(
  items: Array<{ id?: number; name: string }>,
  payload: { name: string },
  excludeId?: number,
): CategoryCreateFieldErrors {
  const fieldErrors = emptyCategoryCreateFieldErrors()
  const normalizedName = payload.name.trim().toLowerCase()

  const comparableItems =
    excludeId === undefined ? items : items.filter((item) => item.id !== excludeId)

  const hasDuplicateName = comparableItems.some(
    (item) => item.name.trim().toLowerCase() === normalizedName,
  )

  if (hasDuplicateName) {
    fieldErrors.name = CATEGORY_DUPLICATE_NAME_MESSAGE
  }

  return fieldErrors
}
