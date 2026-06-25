import type { LegalEntity, LegalEntityApiResource } from '#shared/types/legalEntities'

export function normalizeLegalEntity(item: LegalEntityApiResource): LegalEntity {
  return {
    id: item.id,
    legal_entity: item.legal_entity,
    inn: item.inn,
    kpp: item.kpp ?? null,
  }
}
