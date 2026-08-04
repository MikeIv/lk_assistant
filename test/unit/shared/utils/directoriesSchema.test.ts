import { describe, expect, it } from 'vitest'
import {
  APPLICANT_INVALID_EMAIL_MESSAGE,
  applicantContactEmailSchema,
  applicantFormSchema,
} from '#shared/utils/applicantsSchema'
import { CATEGORY_REQUIRED_NAME_MESSAGE, categoryFormSchema } from '#shared/utils/categoriesSchema'
import {
  LEGAL_ENTITY_REQUIRED_NAME_MESSAGE,
  legalEntityFormSchema,
} from '#shared/utils/legalEntitiesSchema'
import {
  NEGOTIATION_STATUS_REQUIRED_NAME_MESSAGE,
  negotiationStatusFormSchema,
} from '#shared/utils/negotiationStatusesSchema'
import { PREMISE_REQUIRED_ROOM_TYPE_MESSAGE, premiseFormSchema } from '#shared/utils/premisesSchema'
import { ROOM_TYPE_REQUIRED_NAME_MESSAGE, roomTypeFormSchema } from '#shared/utils/roomTypesSchema'
import {
  isTenantCaseApplicantStatus,
  TENANT_CASE_REQUIRED_RESPONSIBLE_MESSAGE,
  TENANT_CASE_REQUIRED_ROOM_MESSAGE,
  tenantCaseFormSchema,
} from '#shared/utils/tenantCasesSchema'

describe('directories *Schema smoke', () => {
  it('rejects empty required fields with expected messages', () => {
    expect(categoryFormSchema.safeParse({ name: '' }).success).toBe(false)
    expect(categoryFormSchema.safeParse({ name: '' }).error?.issues[0]?.message).toBe(
      CATEGORY_REQUIRED_NAME_MESSAGE,
    )
    expect(roomTypeFormSchema.safeParse({ name: '' }).error?.issues[0]?.message).toBe(
      ROOM_TYPE_REQUIRED_NAME_MESSAGE,
    )
    expect(negotiationStatusFormSchema.safeParse({ name: '' }).error?.issues[0]?.message).toBe(
      NEGOTIATION_STATUS_REQUIRED_NAME_MESSAGE,
    )
    expect(
      legalEntityFormSchema.safeParse({ legal_entity: '', inn: '1', kpp: '' }).error?.issues[0]
        ?.message,
    ).toBe(LEGAL_ENTITY_REQUIRED_NAME_MESSAGE)
    expect(
      premiseFormSchema.safeParse({
        room_type_id: '',
        name: 'A',
        floor: '',
        area: '',
        name_bti: '',
        floor_bti: '',
        area_bti: '',
      }).error?.issues[0]?.message,
    ).toBe(PREMISE_REQUIRED_ROOM_TYPE_MESSAGE)
    expect(
      applicantFormSchema.safeParse({
        title: 'A',
        category_id: '1',
        company_group: '',
        legal_entity_ids: [],
      }).success,
    ).toBe(true)
    expect(applicantContactEmailSchema.safeParse('bad').error?.issues[0]?.message).toBe(
      APPLICANT_INVALID_EMAIL_MESSAGE,
    )
  })

  it('validates tenant case form and applicant status guard', () => {
    expect(isTenantCaseApplicantStatus('переговоры')).toBe(true)
    expect(isTenantCaseApplicantStatus('unknown')).toBe(false)

    const result = tenantCaseFormSchema.safeParse({
      room_id: '',
      responsible: '',
      applicants: [],
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues.some((i) => i.message === TENANT_CASE_REQUIRED_ROOM_MESSAGE)).toBe(
      true,
    )
    expect(
      result.error?.issues.some((i) => i.message === TENANT_CASE_REQUIRED_RESPONSIBLE_MESSAGE),
    ).toBe(true)
  })
})
