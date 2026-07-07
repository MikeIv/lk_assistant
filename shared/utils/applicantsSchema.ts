import { z } from 'zod'

import {
  isRussianPhoneEmpty,
  isValidRussianPhone,
  RUSSIAN_PHONE_INVALID_MESSAGE,
} from '#shared/utils/russianPhone'

export const APPLICANT_REQUIRED_TITLE_MESSAGE = 'Укажите бренд или наименование организации'

export const APPLICANT_REQUIRED_CATEGORY_MESSAGE = 'Выберите категорию'

export const APPLICANT_INVALID_EMAIL_MESSAGE = 'Укажите корректный email'

export const APPLICANT_MAX_TITLE_LENGTH = 255
export const APPLICANT_MAX_COMPANY_GROUP_LENGTH = 255

export const applicantFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, APPLICANT_REQUIRED_TITLE_MESSAGE)
    .max(APPLICANT_MAX_TITLE_LENGTH, `Не более ${APPLICANT_MAX_TITLE_LENGTH} символов`),
  category_id: z.string().trim().min(1, APPLICANT_REQUIRED_CATEGORY_MESSAGE),
  company_group: z
    .string()
    .trim()
    .max(
      APPLICANT_MAX_COMPANY_GROUP_LENGTH,
      `Не более ${APPLICANT_MAX_COMPANY_GROUP_LENGTH} символов`,
    ),
})

export type ApplicantFormValues = z.infer<typeof applicantFormSchema>

export const applicantContactEmailSchema = z.string().trim().email(APPLICANT_INVALID_EMAIL_MESSAGE)

const applicantContactEmailFieldSchema = z
  .string()
  .nullable()
  .superRefine((value, ctx) => {
    const trimmed = value?.trim()
    if (!trimmed) {
      return
    }

    const result = applicantContactEmailSchema.safeParse(trimmed)
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error.issues[0]?.message ?? APPLICANT_INVALID_EMAIL_MESSAGE,
      })
    }
  })

const applicantContactPhoneFieldSchema = z
  .string()
  .nullable()
  .superRefine((value, ctx) => {
    if (isRussianPhoneEmpty(value)) {
      return
    }

    if (!isValidRussianPhone(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: RUSSIAN_PHONE_INVALID_MESSAGE,
      })
    }
  })

export const applicantContactFormSchema = z.object({
  name: z.string().nullable(),
  position: z.string().nullable(),
  phone_number: applicantContactPhoneFieldSchema,
  email: applicantContactEmailFieldSchema,
})

export const applicantExtendedFormSchema = applicantFormSchema.extend({
  contacts: z.array(applicantContactFormSchema),
})

export type ApplicantContactFormValues = z.infer<typeof applicantContactFormSchema>
export type ApplicantExtendedFormValues = z.infer<typeof applicantExtendedFormSchema>
