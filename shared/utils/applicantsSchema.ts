import { z } from 'zod'

export const APPLICANT_REQUIRED_TITLE_MESSAGE = 'Укажите бренд или наименование организации'

export const APPLICANT_REQUIRED_CATEGORY_MESSAGE = 'Выберите категорию'

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
