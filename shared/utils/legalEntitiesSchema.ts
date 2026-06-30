import { z } from 'zod'

export const LEGAL_ENTITY_REQUIRED_NAME_MESSAGE = 'Укажите наименование юридического лица'

export const LEGAL_ENTITY_REQUIRED_INN_MESSAGE = 'Укажите ИНН'

export const LEGAL_ENTITY_MAX_NAME_LENGTH = 255
export const LEGAL_ENTITY_MAX_INN_LENGTH = 32
export const LEGAL_ENTITY_MAX_KPP_LENGTH = 9

export const legalEntityFormSchema = z.object({
  legal_entity: z
    .string()
    .trim()
    .min(1, LEGAL_ENTITY_REQUIRED_NAME_MESSAGE)
    .max(LEGAL_ENTITY_MAX_NAME_LENGTH, `Не более ${LEGAL_ENTITY_MAX_NAME_LENGTH} символов`),
  inn: z
    .string()
    .trim()
    .min(1, LEGAL_ENTITY_REQUIRED_INN_MESSAGE)
    .max(LEGAL_ENTITY_MAX_INN_LENGTH, `Не более ${LEGAL_ENTITY_MAX_INN_LENGTH} символов`),
  kpp: z
    .string()
    .trim()
    .max(LEGAL_ENTITY_MAX_KPP_LENGTH, `Не более ${LEGAL_ENTITY_MAX_KPP_LENGTH} символов`),
})

export type LegalEntityFormValues = z.infer<typeof legalEntityFormSchema>
