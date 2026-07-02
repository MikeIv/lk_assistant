import { z } from 'zod'

export const ROOM_TYPE_REQUIRED_NAME_MESSAGE = 'Укажите наименование типа помещения'

export const ROOM_TYPE_MAX_NAME_LENGTH = 255

export const roomTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ROOM_TYPE_REQUIRED_NAME_MESSAGE)
    .max(ROOM_TYPE_MAX_NAME_LENGTH, `Не более ${ROOM_TYPE_MAX_NAME_LENGTH} символов`),
})

export type RoomTypeFormValues = z.infer<typeof roomTypeFormSchema>
