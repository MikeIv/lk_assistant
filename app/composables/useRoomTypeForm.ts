import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type { RoomTypeCreateFieldErrors, RoomTypeCreatePayload } from '#shared/types/roomTypes'
import { roomTypeFormSchema } from '#shared/utils/roomTypesSchema'
import { normalizeRoomTypeCreatePayload } from '#shared/utils/roomTypesValidation'

const FORM_FIELD_KEYS = ['name'] as const satisfies ReadonlyArray<keyof RoomTypeCreateFieldErrors>

export interface RoomTypeFormInitialValues {
  name: string
}

const EMPTY_FORM_VALUES: RoomTypeFormInitialValues = {
  name: '',
}

export function useRoomTypeForm(initialValues: RoomTypeFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(roomTypeFormSchema),
    initialValues: { ...initialValues },
  })

  const [name, nameAttrs] = form.defineField('name')

  function applyServerFieldErrors(fieldErrors: RoomTypeCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }
  }

  function toPayload(): RoomTypeCreatePayload {
    return normalizeRoomTypeCreatePayload({
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
