import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type { CategoryCreateFieldErrors, CategoryCreatePayload } from '#shared/types/categories'
import { categoryFormSchema } from '#shared/utils/categoriesSchema'
import { normalizeCategoryCreatePayload } from '#shared/utils/categoriesValidation'

const FORM_FIELD_KEYS = ['name'] as const satisfies ReadonlyArray<keyof CategoryCreateFieldErrors>

export interface CategoryFormInitialValues {
  name: string
}

const EMPTY_FORM_VALUES: CategoryFormInitialValues = {
  name: '',
}

export function useCategoryForm(initialValues: CategoryFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(categoryFormSchema),
    initialValues: { ...initialValues },
  })

  const [name, nameAttrs] = form.defineField('name')

  function applyServerFieldErrors(fieldErrors: CategoryCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }
  }

  function toPayload(): CategoryCreatePayload {
    return normalizeCategoryCreatePayload({
      name: form.values.name ?? '',
    })
  }

  return {
    ...form,
    name,
    nameAttrs,
    applyServerFieldErrors,
    toPayload,
  }
}
