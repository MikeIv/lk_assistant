import { z } from 'zod'

export const CATEGORY_REQUIRED_NAME_MESSAGE = 'Укажите наименование категории'

export const CATEGORY_MAX_NAME_LENGTH = 255

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, CATEGORY_REQUIRED_NAME_MESSAGE)
    .max(CATEGORY_MAX_NAME_LENGTH, `Не более ${CATEGORY_MAX_NAME_LENGTH} символов`),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
