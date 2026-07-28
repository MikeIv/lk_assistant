import { describe, expect, it } from 'vitest'
import type { Applicant } from '#shared/types/applicants'
import type { Category } from '#shared/types/categories'
import type { LegalEntity } from '#shared/types/legalEntities'
import type { NegotiationStatus } from '#shared/types/negotiationStatuses'
import type { Premise } from '#shared/types/premises'
import type { RoomType } from '#shared/types/roomTypes'
import {
  buildApplicantsPagination,
  matchesApplicantSearch,
  paginateApplicants,
  sortApplicants,
} from '#shared/utils/applicantsTable'
import {
  buildCategoriesPagination,
  matchesCategorySearch,
  paginateCategories,
  sortCategories,
} from '#shared/utils/categoriesTable'
import {
  buildLegalEntitiesPagination,
  matchesLegalEntitySearch,
  paginateLegalEntities,
  sortLegalEntities,
} from '#shared/utils/legalEntitiesTable'
import {
  buildNegotiationStatusesPagination,
  matchesNegotiationStatusSearch,
  paginateNegotiationStatuses,
  sortNegotiationStatuses,
} from '#shared/utils/negotiationStatusesTable'
import {
  buildPremisesPagination,
  matchesPremiseSearch,
  paginatePremises,
  sortPremises,
} from '#shared/utils/premisesTable'
import {
  buildRoomTypesPagination,
  matchesRoomTypeSearch,
  paginateRoomTypes,
  sortRoomTypes,
} from '#shared/utils/roomTypesTable'

type Pagination = {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  rangeFrom: number
  rangeTo: number
}

type TableContract = {
  name: string
  matchesEmpty: () => boolean
  matchesHit: () => boolean
  matchesMiss: () => boolean
  sortDescIds: () => number[]
  localeSortIds: () => number[]
  nullSortAscIds?: () => number[]
  buildPagination: (total: number, page: number, perPage: number) => Pagination
  paginateIds: (page: number, perPage: number) => number[]
}

const categories: Category[] = [
  { id: 2, name: 'Яблоко' },
  { id: 1, name: 'Абрикос' },
  { id: 3, name: 'Банан' },
]

const roomTypes: RoomType[] = [
  { id: 2, name: 'Яблоко' },
  { id: 1, name: 'Абрикос' },
  { id: 3, name: 'Банан' },
]

const negotiationStatuses: NegotiationStatus[] = [
  {
    id: 2,
    name: 'Яблоко',
    status: 'apple',
    created_by_id: null,
    responsible: null,
    created_at: '2026-01-01',
  },
  {
    id: 1,
    name: 'Абрикос',
    status: 'apricot',
    created_by_id: null,
    responsible: null,
    created_at: '2026-01-01',
  },
  {
    id: 3,
    name: 'Банан',
    status: 'banana',
    created_by_id: null,
    responsible: null,
    created_at: '2026-01-01',
  },
]

const premises: Premise[] = [
  {
    id: 2,
    name: 'Яблоко',
    floor: '2',
    area: 20,
    name_bti: null,
    floor_bti: null,
    area_bti: null,
    room_type_id: 1,
    room_type: 'A',
  },
  {
    id: 1,
    name: 'Абрикос',
    floor: null,
    area: null,
    name_bti: null,
    floor_bti: null,
    area_bti: null,
    room_type_id: 1,
    room_type: 'B',
  },
  {
    id: 3,
    name: 'Банан',
    floor: '1',
    area: 10,
    name_bti: 'BTI',
    floor_bti: '1',
    area_bti: 11,
    room_type_id: 2,
    room_type: 'C',
  },
]

const legalEntities: LegalEntity[] = [
  { id: 2, legal_entity: 'Яблоко ООО', inn: '222', kpp: null },
  { id: 1, legal_entity: 'Абрикос ООО', inn: '111', kpp: '111001' },
  { id: 3, legal_entity: 'Банан ООО', inn: '333', kpp: '333001' },
]

const applicants: Applicant[] = [
  {
    id: 2,
    title: 'Яблоко',
    company_group: null,
    category_id: 1,
    category_name: 'Cat',
    legal_entities: [{ id: 10, legal_entity: 'LE Hit', inn: '1', kpp: null }],
    contacts: [],
  },
  {
    id: 1,
    title: 'Абрикос',
    company_group: 'Group A',
    category_id: 2,
    category_name: 'Other',
    legal_entities: [],
    contacts: [],
  },
  {
    id: 3,
    title: 'Банан',
    company_group: 'Group B',
    category_id: 3,
    category_name: null,
    legal_entities: [],
    contacts: [],
  },
]

const contracts: TableContract[] = [
  {
    name: 'categories',
    matchesEmpty: () => matchesCategorySearch(categories[0]!, '  '),
    matchesHit: () => matchesCategorySearch(categories[1]!, 'абри'),
    matchesMiss: () => matchesCategorySearch(categories[0]!, 'zzz'),
    sortDescIds: () => sortCategories(categories, 'id', 'desc').map((i) => i.id),
    localeSortIds: () => sortCategories(categories, 'name', 'asc').map((i) => i.id),
    buildPagination: buildCategoriesPagination,
    paginateIds: (page, perPage) => paginateCategories(categories, page, perPage).map((i) => i.id),
  },
  {
    name: 'roomTypes',
    matchesEmpty: () => matchesRoomTypeSearch(roomTypes[0]!, '  '),
    matchesHit: () => matchesRoomTypeSearch(roomTypes[1]!, 'абри'),
    matchesMiss: () => matchesRoomTypeSearch(roomTypes[0]!, 'zzz'),
    sortDescIds: () => sortRoomTypes(roomTypes, 'id', 'desc').map((i) => i.id),
    localeSortIds: () => sortRoomTypes(roomTypes, 'name', 'asc').map((i) => i.id),
    buildPagination: buildRoomTypesPagination,
    paginateIds: (page, perPage) => paginateRoomTypes(roomTypes, page, perPage).map((i) => i.id),
  },
  {
    name: 'negotiationStatuses',
    matchesEmpty: () => matchesNegotiationStatusSearch(negotiationStatuses[0]!, ''),
    matchesHit: () => matchesNegotiationStatusSearch(negotiationStatuses[1]!, 'apricot'),
    matchesMiss: () => matchesNegotiationStatusSearch(negotiationStatuses[0]!, 'zzz'),
    sortDescIds: () => sortNegotiationStatuses(negotiationStatuses, 'id', 'desc').map((i) => i.id),
    localeSortIds: () =>
      sortNegotiationStatuses(negotiationStatuses, 'name', 'asc').map((i) => i.id),
    buildPagination: buildNegotiationStatusesPagination,
    paginateIds: (page, perPage) =>
      paginateNegotiationStatuses(negotiationStatuses, page, perPage).map((i) => i.id),
  },
  {
    name: 'premises',
    matchesEmpty: () => matchesPremiseSearch(premises[0]!, ' '),
    matchesHit: () => matchesPremiseSearch(premises[2]!, 'bti'),
    matchesMiss: () => matchesPremiseSearch(premises[0]!, 'zzz'),
    sortDescIds: () => sortPremises(premises, 'id', 'desc').map((i) => i.id),
    localeSortIds: () => sortPremises(premises, 'name', 'asc').map((i) => i.id),
    nullSortAscIds: () => sortPremises(premises, 'area', 'asc').map((i) => i.id),
    buildPagination: buildPremisesPagination,
    paginateIds: (page, perPage) => paginatePremises(premises, page, perPage).map((i) => i.id),
  },
  {
    name: 'legalEntities',
    matchesEmpty: () => matchesLegalEntitySearch(legalEntities[0]!, ''),
    matchesHit: () => matchesLegalEntitySearch(legalEntities[1]!, '111001'),
    matchesMiss: () => matchesLegalEntitySearch(legalEntities[0]!, 'zzz'),
    sortDescIds: () => sortLegalEntities(legalEntities, 'id', 'desc').map((i) => i.id),
    localeSortIds: () => sortLegalEntities(legalEntities, 'legal_entity', 'asc').map((i) => i.id),
    nullSortAscIds: () => sortLegalEntities(legalEntities, 'kpp', 'asc').map((i) => i.id),
    buildPagination: buildLegalEntitiesPagination,
    paginateIds: (page, perPage) =>
      paginateLegalEntities(legalEntities, page, perPage).map((i) => i.id),
  },
  {
    name: 'applicants',
    matchesEmpty: () => matchesApplicantSearch(applicants[0]!, ''),
    matchesHit: () => matchesApplicantSearch(applicants[0]!, 'LE Hit'),
    matchesMiss: () => matchesApplicantSearch(applicants[0]!, 'zzz'),
    sortDescIds: () => sortApplicants(applicants, 'id', 'desc').map((i) => i.id),
    localeSortIds: () => sortApplicants(applicants, 'title', 'asc').map((i) => i.id),
    nullSortAscIds: () => sortApplicants(applicants, 'company_group', 'asc').map((i) => i.id),
    buildPagination: buildApplicantsPagination,
    paginateIds: (page, perPage) => paginateApplicants(applicants, page, perPage).map((i) => i.id),
  },
]

describe.each(contracts)('directories *Table contract: $name', (contract) => {
  it('matches empty/whitespace search as true', () => {
    expect(contract.matchesEmpty()).toBe(true)
  })

  it('matches haystack hit and misses unknown query', () => {
    expect(contract.matchesHit()).toBe(true)
    expect(contract.matchesMiss()).toBe(false)
  })

  it('sorts by locale ru for name-like key and by id desc', () => {
    expect(contract.localeSortIds()).toEqual([1, 3, 2])
    expect(contract.sortDescIds()).toEqual([3, 2, 1])
  })

  it('builds pagination for empty list, perPage=0, and out-of-range page', () => {
    expect(contract.buildPagination(0, 5, 10)).toEqual({
      currentPage: 1,
      lastPage: 1,
      perPage: 10,
      total: 0,
      rangeFrom: 0,
      rangeTo: 0,
    })

    expect(contract.buildPagination(25, 1, 0)).toMatchObject({
      perPage: 1,
      lastPage: 25,
      currentPage: 1,
      rangeFrom: 1,
      rangeTo: 1,
    })

    expect(contract.buildPagination(3, 99, 2)).toMatchObject({
      currentPage: 2,
      lastPage: 2,
      perPage: 2,
      total: 3,
      rangeFrom: 3,
      rangeTo: 3,
    })
  })

  it('paginates slice and returns empty for empty source page', () => {
    expect(contract.paginateIds(1, 2)).toHaveLength(2)
    expect(contract.paginateIds(2, 2)).toHaveLength(1)
    expect(contract.paginateIds(5, 2)).toEqual([])
  })

  if (contract.nullSortAscIds) {
    it('sorts nulls consistently on nullable key (asc)', () => {
      const ids = contract.nullSortAscIds!()
      expect(ids).toHaveLength(3)
      expect(new Set(ids).size).toBe(3)
    })
  }
})
