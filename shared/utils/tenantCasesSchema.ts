import { z } from 'zod'

import type { TenantCaseApplicantStatus } from '#shared/types/tenantCases'
import { TENANT_CASE_APPLICANT_STATUS_OPTIONS } from '#shared/utils/tenantCasesTable'

export const TENANT_CASE_REQUIRED_ROOM_MESSAGE = 'Выберите помещение'

export const TENANT_CASE_REQUIRED_APPLICANT_MESSAGE = 'Выберите претендента'

export const TENANT_CASE_REQUIRED_STATUS_MESSAGE = 'Выберите статус'

export const TENANT_CASE_REQUIRED_FIRST_CONTACT_MESSAGE = 'Укажите дату первого контакта'

export const TENANT_CASE_MAX_RESPONSIBLE_LENGTH = 255

const tenantCaseApplicantStatusSchema = z.enum(TENANT_CASE_APPLICANT_STATUS_OPTIONS)

const tenantCaseNegotiationSchema = z.object({
  date: z.string(),
  info: z.string(),
})

export const tenantCaseApplicantFormSchema = z.object({
  tenant_applicant_id: z.string().trim().min(1, TENANT_CASE_REQUIRED_APPLICANT_MESSAGE),
  status: tenantCaseApplicantStatusSchema,
  first_contact_date: z.string().trim().min(1, TENANT_CASE_REQUIRED_FIRST_CONTACT_MESSAGE),
  next_contact_date: z.string(),
  negotiations: z.array(tenantCaseNegotiationSchema),
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

export type TenantCaseApplicantFormValues = z.infer<typeof tenantCaseApplicantFormSchema>

export function isTenantCaseApplicantStatus(value: string): value is TenantCaseApplicantStatus {
  return TENANT_CASE_APPLICANT_STATUS_OPTIONS.includes(value as TenantCaseApplicantStatus)
}
