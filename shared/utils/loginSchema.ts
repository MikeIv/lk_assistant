import { z } from 'zod'

export const LOGIN_EMAIL_REQUIRED_MESSAGE = 'Укажите адрес электронной почты'
export const LOGIN_EMAIL_INVALID_MESSAGE = 'Введите корректный адрес электронной почты'
export const LOGIN_PASSWORD_REQUIRED_MESSAGE = 'Укажите пароль'
export const LOGIN_EMAIL_MAX_LENGTH = 255

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, LOGIN_EMAIL_REQUIRED_MESSAGE)
    .max(LOGIN_EMAIL_MAX_LENGTH, `Не более ${LOGIN_EMAIL_MAX_LENGTH} символов`)
    .email(LOGIN_EMAIL_INVALID_MESSAGE),
  password: z.string().min(1, LOGIN_PASSWORD_REQUIRED_MESSAGE),
  remember: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
