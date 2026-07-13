import { z } from 'zod'

export const NEGOTIATION_STATUS_REQUIRED_NAME_MESSAGE = 'Укажите наименование статуса'

export const NEGOTIATION_STATUS_MAX_NAME_LENGTH = 255

export const negotiationStatusFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, NEGOTIATION_STATUS_REQUIRED_NAME_MESSAGE)
    .max(
      NEGOTIATION_STATUS_MAX_NAME_LENGTH,
      `Не более ${NEGOTIATION_STATUS_MAX_NAME_LENGTH} символов`,
    ),
})

export type NegotiationStatusFormValues = z.infer<typeof negotiationStatusFormSchema>
