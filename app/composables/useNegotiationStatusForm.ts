import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type {
  NegotiationStatusCreateFieldErrors,
  NegotiationStatusCreatePayload,
} from '#shared/types/negotiationStatuses'
import { negotiationStatusFormSchema } from '#shared/utils/negotiationStatusesSchema'
import { normalizeNegotiationStatusCreatePayload } from '#shared/utils/negotiationStatusesValidation'

const FORM_FIELD_KEYS = ['name'] as const satisfies ReadonlyArray<
  keyof NegotiationStatusCreateFieldErrors
>

export interface NegotiationStatusFormInitialValues {
  name: string
}

const EMPTY_FORM_VALUES: NegotiationStatusFormInitialValues = {
  name: '',
}

export function useNegotiationStatusForm(
  initialValues: NegotiationStatusFormInitialValues = EMPTY_FORM_VALUES,
) {
  const form = useForm({
    validationSchema: toTypedSchema(negotiationStatusFormSchema),
    initialValues: { ...initialValues },
  })

  const [name, nameAttrs] = form.defineField('name')

  function applyServerFieldErrors(fieldErrors: NegotiationStatusCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }
  }

  function toPayload(): NegotiationStatusCreatePayload {
    return normalizeNegotiationStatusCreatePayload({
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
