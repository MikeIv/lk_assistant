import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type {
  LegalEntityCreateFieldErrors,
  LegalEntityCreatePayload,
} from '#shared/types/legalEntities'
import { legalEntityFormSchema } from '#shared/utils/legalEntitiesSchema'
import { normalizeLegalEntityCreatePayload } from '#shared/utils/legalEntitiesValidation'

const FORM_FIELD_KEYS = ['legal_entity', 'inn', 'kpp'] as const satisfies ReadonlyArray<
  keyof LegalEntityCreateFieldErrors
>

export interface LegalEntityFormInitialValues {
  legal_entity: string
  inn: string
  kpp: string
}

const EMPTY_FORM_VALUES: LegalEntityFormInitialValues = {
  legal_entity: '',
  inn: '',
  kpp: '',
}

export function useLegalEntityForm(
  initialValues: LegalEntityFormInitialValues = EMPTY_FORM_VALUES,
) {
  const form = useForm({
    validationSchema: toTypedSchema(legalEntityFormSchema),
    initialValues: { ...initialValues },
  })

  const [legalEntity, legalEntityAttrs] = form.defineField('legal_entity')
  const [inn, innAttrs] = form.defineField('inn')
  const [kpp, kppAttrs] = form.defineField('kpp')

  function applyServerFieldErrors(fieldErrors: LegalEntityCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }
  }

  function toPayload(): LegalEntityCreatePayload {
    return normalizeLegalEntityCreatePayload({
      legal_entity: form.values.legal_entity ?? '',
      inn: form.values.inn ?? '',
      kpp: form.values.kpp ?? '',
    })
  }

  return {
    ...form,
    legalEntity,
    legalEntityAttrs,
    inn,
    innAttrs,
    kpp,
    kppAttrs,
    applyServerFieldErrors,
    toPayload,
  }
}
