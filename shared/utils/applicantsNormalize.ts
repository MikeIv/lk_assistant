import type { Applicant, ApplicantApiResource, ApplicantContact } from '#shared/types/applicants'
import { normalizeApplicantContact } from '#shared/utils/applicantsValidation'

export function normalizeApplicant(item: ApplicantApiResource): Applicant {
  return {
    id: item.id,
    title: item.title,
    company_group: item.company_group ?? null,
    category_id: item.category_id,
    category_name: item.category?.name ?? null,
    legal_entities: (item.legal_entities ?? []).map((entity) => ({
      id: entity.id,
      legal_entity: entity.legal_entity,
      inn: entity.inn,
      kpp: entity.kpp ?? null,
    })),
    contacts: (item.contacts ?? [])
      .map((contact) => normalizeApplicantContact(contact))
      .filter((contact): contact is ApplicantContact => contact !== null),
  }
}
