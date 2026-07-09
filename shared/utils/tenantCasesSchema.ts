import { z } from 'zod'

import type { TenantCaseApplicantStatus } from '#shared/types/tenantCases'
import { TENANT_CASE_APPLICANT_STATUS_OPTIONS } from '#shared/utils/tenantCasesTable'

export const TENANT_CASE_REQUIRED_ROOM_MESSAGE = 'Выберите помещение'

export const TENANT_CASE_REQUIRED_APPLICANT_MESSAGE = 'Выберите претендента'

export const TENANT_CASE_REQUIRED_STATUS_MESSAGE = 'Выберите статус переговоров'

export const TENANT_CASE_REQUIRED_NEGOTIATION_INFO_MESSAGE = 'Введите информацию о переговорах'

export const TENANT_CASE_REQUIRED_FIRST_CONTACT_MESSAGE = 'Укажите дату первого контакта'

export const TENANT_CASE_MAX_RESPONSIBLE_LENGTH = 255

const tenantCaseNegotiationSchema = z.object({
  date: z.string().trim().min(1),
  info: z.string().trim().min(1, TENANT_CASE_REQUIRED_NEGOTIATION_INFO_MESSAGE),
})

export const tenantCaseApplicantFormSchema = z.object({
  /** ID блока в деле; null — новый претендент. */
  id: z.number().nullable().optional(),
  tenant_applicant_id: z.string().trim().min(1, TENANT_CASE_REQUIRED_APPLICANT_MESSAGE),
  /** Display-only: имя претендента (collapse / read-only). */
  tenant_applicant: z.string().optional(),
  /** Display-only: категория из справочника / show. */
  category: z.string().optional(),
  status: z
    .string()
    .trim()
    .min(1, TENANT_CASE_REQUIRED_STATUS_MESSAGE)
    .refine((value) => isTenantCaseApplicantStatus(value), {
      message: TENANT_CASE_REQUIRED_STATUS_MESSAGE,
    }),
  first_contact_date: z.string().trim().min(1, TENANT_CASE_REQUIRED_FIRST_CONTACT_MESSAGE),
  next_contact_date: z.string(),
  negotiations: z.array(tenantCaseNegotiationSchema).min(1),
})

export const tenantCaseFormSchema = z.object({
  room_id: z.string().trim().min(1, TENANT_CASE_REQUIRED_ROOM_MESSAGE),
  responsible_name: z
    .string()
    .trim()
    .max(
      TENANT_CASE_MAX_RESPONSIBLE_LENGTH,
      `Не более ${TENANT_CASE_MAX_RESPONSIBLE_LENGTH} символов`,
    ),
  applicants: z.array(tenantCaseApplicantFormSchema).min(1, 'Добавьте хотя бы одного претендента'),
})

export type TenantCaseFormValues = z.infer<typeof tenantCaseFormSchema>

export type TenantCaseApplicantFormValues = Omit<
  z.infer<typeof tenantCaseApplicantFormSchema>,
  'status'
> & {
  status: string
}

export function isTenantCaseApplicantStatus(value: string): value is TenantCaseApplicantStatus {
  return TENANT_CASE_APPLICANT_STATUS_OPTIONS.includes(value as TenantCaseApplicantStatus)
}
