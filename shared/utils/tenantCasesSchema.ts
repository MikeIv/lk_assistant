import { z } from 'zod'

import type { TenantCaseApplicantStatus } from '#shared/types/tenantCases'
import { TENANT_CASE_APPLICANT_STATUS_OPTIONS } from '#shared/utils/tenantCasesTable'

export const TENANT_CASE_REQUIRED_ROOM_MESSAGE = 'Выберите помещение'

export const TENANT_CASE_REQUIRED_RESPONSIBLE_MESSAGE = 'Выберите ответственного'

export const TENANT_CASE_REQUIRED_APPLICANT_MESSAGE = 'Выберите претендента'

export const TENANT_CASE_REQUIRED_STATUS_MESSAGE = 'Выберите статус переговоров'

export const TENANT_CASE_REQUIRED_NEGOTIATION_INFO_MESSAGE = 'Введите информацию о переговорах'

export const TENANT_CASE_REQUIRED_FIRST_CONTACT_MESSAGE = 'Укажите дату первого контакта'

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
  /** Display-only: статус из show (`status`). */
  status: z.string().optional(),
  negotiation_status_id: z.string().trim().min(1, TENANT_CASE_REQUIRED_STATUS_MESSAGE),
  first_contact_date: z.string().trim().min(1, TENANT_CASE_REQUIRED_FIRST_CONTACT_MESSAGE),
  next_contact_date: z.string(),
  negotiations: z.array(tenantCaseNegotiationSchema).min(1),
})

export const tenantCaseFormSchema = z.object({
  room_id: z.string().trim().min(1, TENANT_CASE_REQUIRED_ROOM_MESSAGE),
  /** ID ответственного (строка для UiSelect). */
  responsible: z.string().trim().min(1, TENANT_CASE_REQUIRED_RESPONSIBLE_MESSAGE),
  applicants: z.array(tenantCaseApplicantFormSchema).min(1, 'Добавьте хотя бы одного претендента'),
})

export type TenantCaseFormValues = z.infer<typeof tenantCaseFormSchema>

export type TenantCaseApplicantFormValues = Omit<
  z.infer<typeof tenantCaseApplicantFormSchema>,
  'status'
> & {
  status?: string
}

export function isTenantCaseApplicantStatus(value: string): value is TenantCaseApplicantStatus {
  return TENANT_CASE_APPLICANT_STATUS_OPTIONS.includes(value as TenantCaseApplicantStatus)
}
