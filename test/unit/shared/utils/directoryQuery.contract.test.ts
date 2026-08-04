import { describe, expect, it } from 'vitest'
import { buildApplicantsQueryParams } from '#shared/utils/applicantsQuery'
import { buildCategoriesQueryParams } from '#shared/utils/categoriesQuery'
import { buildDirectoryListQueryParams } from '#shared/utils/directoryListQuery'
import { buildLegalEntitiesQueryParams } from '#shared/utils/legalEntitiesQuery'
import { buildNegotiationStatusesQueryParams } from '#shared/utils/negotiationStatusesQuery'
import { buildPremisesQueryParams } from '#shared/utils/premisesQuery'
import { buildRoomTypesQueryParams } from '#shared/utils/roomTypesQuery'
import { buildTenantCasesQueryParams } from '#shared/utils/tenantCasesQuery'

describe('buildDirectoryListQueryParams', () => {
  it('always sets page/per_page/sort/direction and omits blank search', () => {
    const params = new URLSearchParams(
      buildDirectoryListQueryParams({
        page: 2,
        perPage: 25,
        search: '   ',
        sortKey: 'name',
        sortDirection: 'asc',
      }),
    )

    expect(params.get('page')).toBe('2')
    expect(params.get('per_page')).toBe('25')
    expect(params.get('sort')).toBe('name')
    expect(params.get('direction')).toBe('asc')
    expect(params.has('search')).toBe(false)
  })

  it('trims and includes search when present', () => {
    const params = new URLSearchParams(
      buildDirectoryListQueryParams({
        page: 1,
        perPage: 10,
        search: '  foo  ',
        sortKey: 'id',
        sortDirection: 'desc',
      }),
    )

    expect(params.get('search')).toBe('foo')
  })
})

const typedWrappers = [
  {
    name: 'applicants',
    build: buildApplicantsQueryParams,
    sortKey: 'title' as const,
  },
  {
    name: 'categories',
    build: buildCategoriesQueryParams,
    sortKey: 'name' as const,
  },
  {
    name: 'legalEntities',
    build: buildLegalEntitiesQueryParams,
    sortKey: 'legal_entity' as const,
  },
  {
    name: 'negotiationStatuses',
    build: buildNegotiationStatusesQueryParams,
    sortKey: 'name' as const,
  },
  {
    name: 'premises',
    build: buildPremisesQueryParams,
    sortKey: 'name' as const,
  },
  {
    name: 'roomTypes',
    build: buildRoomTypesQueryParams,
    sortKey: 'name' as const,
  },
  {
    name: 'tenantCases',
    build: buildTenantCasesQueryParams,
    sortKey: 'number' as const,
  },
]

describe.each(typedWrappers)('build*QueryParams typed wrapper: $name', (contract) => {
  it('delegates to shared list query shape', () => {
    const query = contract.build({
      page: 1,
      perPage: 10,
      search: 'x',
      sortKey: contract.sortKey,
      sortDirection: 'desc',
    })
    const params = new URLSearchParams(query)

    expect(params.get('sort')).toBe(contract.sortKey)
    expect(params.get('search')).toBe('x')
  })
})
