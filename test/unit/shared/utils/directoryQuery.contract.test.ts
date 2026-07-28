import { describe, expect, it } from 'vitest'
import { buildApplicantsQueryParams } from '#shared/utils/applicantsQuery'
import { buildLegalEntitiesQueryParams } from '#shared/utils/legalEntitiesQuery'
import { buildTenantCasesQueryParams } from '#shared/utils/tenantCasesQuery'

const contracts = [
  {
    name: 'applicants',
    build: buildApplicantsQueryParams,
    sortKey: 'title' as const,
  },
  {
    name: 'legalEntities',
    build: buildLegalEntitiesQueryParams,
    sortKey: 'legal_entity' as const,
  },
  {
    name: 'tenantCases',
    build: buildTenantCasesQueryParams,
    sortKey: 'number' as const,
  },
]

describe.each(contracts)('build*QueryParams: $name', (contract) => {
  it('always sets page/per_page/sort/direction and omits blank search', () => {
    const query = contract.build({
      page: 2,
      perPage: 25,
      search: '   ',
      sortKey: contract.sortKey,
      sortDirection: 'asc',
    })
    const params = new URLSearchParams(query)

    expect(params.get('page')).toBe('2')
    expect(params.get('per_page')).toBe('25')
    expect(params.get('sort')).toBe(contract.sortKey)
    expect(params.get('direction')).toBe('asc')
    expect(params.has('search')).toBe(false)
  })

  it('trims and includes search when present', () => {
    const query = contract.build({
      page: 1,
      perPage: 10,
      search: '  foo  ',
      sortKey: contract.sortKey,
      sortDirection: 'desc',
    })
    const params = new URLSearchParams(query)

    expect(params.get('search')).toBe('foo')
  })
})
