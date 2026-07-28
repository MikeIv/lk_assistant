import { describe, expect, it } from 'vitest'
import { normalizeApplicant } from '#shared/utils/applicantsNormalize'
import { normalizeCategory } from '#shared/utils/categoriesNormalize'
import { normalizeLegalEntity } from '#shared/utils/legalEntitiesNormalize'
import {
  mapNegotiationStatusesToSelectOptions,
  normalizeNegotiationStatus,
} from '#shared/utils/negotiationStatusesNormalize'
import { normalizePremise } from '#shared/utils/premisesNormalize'
import { isPremiseSortKey } from '#shared/utils/premisesTable'
import {
  isLegalEntitySortKey,
  toLegalEntitiesApiPagination,
} from '#shared/utils/legalEntitiesTable'
import { normalizeRoomType } from '#shared/utils/roomTypesNormalize'
import { toApplicantsApiPagination } from '#shared/utils/applicantsTable'

describe('directories *Normalize', () => {
  it('normalizes category/roomType/legalEntity/premise/status', () => {
    expect(normalizeCategory({ id: 1, name: 'A' })).toEqual({ id: 1, name: 'A' })
    expect(normalizeRoomType({ id: 2, name: 'B' })).toEqual({ id: 2, name: 'B' })
    expect(normalizeLegalEntity({ id: 3, legal_entity: 'LE', inn: '1', kpp: undefined })).toEqual({
      id: 3,
      legal_entity: 'LE',
      inn: '1',
      kpp: null,
    })
    expect(
      normalizePremise({
        id: 4,
        name: 'R',
        floor: undefined as unknown as null,
        area: undefined as unknown as null,
        name_bti: undefined as unknown as null,
        floor_bti: undefined as unknown as null,
        area_bti: undefined as unknown as null,
        room_type_id: 1,
        room_type: undefined as unknown as null,
      }),
    ).toMatchObject({
      floor: null,
      area: null,
      room_type: null,
    })

    const status = normalizeNegotiationStatus({
      id: 5,
      status: 's',
      name: 'Name',
      created_at: '2026-01-01',
    })
    expect(status.created_by_id).toBeNull()
    expect(mapNegotiationStatusesToSelectOptions([status])[0]).toMatchObject({
      value: '5',
      label: 'Name',
    })
  })

  it('normalizes applicant with optional nested fields', () => {
    const applicant = normalizeApplicant({
      id: 1,
      title: 'Brand',
      company_group: null,
      category_id: 2,
      category: { id: 2, name: 'Cat' },
      legal_entities: [{ id: 9, legal_entity: 'LE', inn: '1', kpp: null }],
      contacts: [{ name: null, position: null, phone_number: null, email: null }],
    })

    expect(applicant.category_name).toBe('Cat')
    expect(applicant.contacts).toEqual([])
    expect(applicant.legal_entities).toHaveLength(1)
  })

  it('guards sort keys and maps API pagination', () => {
    expect(isPremiseSortKey('area')).toBe(true)
    expect(isPremiseSortKey('nope')).toBe(false)
    expect(isLegalEntitySortKey('inn')).toBe(true)
    expect(isLegalEntitySortKey('nope')).toBe(false)

    expect(
      toApplicantsApiPagination({
        current_page: 2,
        last_page: 3,
        per_page: 10,
        total: 25,
      }),
    ).toMatchObject({ currentPage: 2, rangeFrom: 11, rangeTo: 20 })

    expect(
      toLegalEntitiesApiPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      }),
    ).toMatchObject({ rangeFrom: 0, rangeTo: 0 })
  })
})
