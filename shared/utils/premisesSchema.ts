import { z } from 'zod'

export const PREMISE_REQUIRED_ROOM_TYPE_MESSAGE = 'Выберите тип помещения'

export const PREMISE_REQUIRED_NAME_MESSAGE = 'Укажите номер помещения'

export const PREMISE_MAX_TEXT_LENGTH = 255

const optionalAreaField = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      return
    }

    const normalized = value.replace(',', '.')
    const parsed = Number(normalized)

    if (Number.isNaN(parsed)) {
      context.addIssue({
        code: 'custom',
        message: 'Укажите число',
      })
      return
    }

    if (parsed < 0) {
      context.addIssue({
        code: 'custom',
        message: 'Значение не может быть отрицательным',
      })
    }
  })

export const premiseFormSchema = z.object({
  room_type_id: z.string().trim().min(1, PREMISE_REQUIRED_ROOM_TYPE_MESSAGE),
  name: z
    .string()
    .trim()
    .min(1, PREMISE_REQUIRED_NAME_MESSAGE)
    .max(PREMISE_MAX_TEXT_LENGTH, `Не более ${PREMISE_MAX_TEXT_LENGTH} символов`),
  floor: z
    .string()
    .trim()
    .max(PREMISE_MAX_TEXT_LENGTH, `Не более ${PREMISE_MAX_TEXT_LENGTH} символов`),
  area: optionalAreaField,
  name_bti: z
    .string()
    .trim()
    .max(PREMISE_MAX_TEXT_LENGTH, `Не более ${PREMISE_MAX_TEXT_LENGTH} символов`),
  floor_bti: z
    .string()
    .trim()
    .max(PREMISE_MAX_TEXT_LENGTH, `Не более ${PREMISE_MAX_TEXT_LENGTH} символов`),
  area_bti: optionalAreaField,
})

export type PremiseFormValues = z.infer<typeof premiseFormSchema>
