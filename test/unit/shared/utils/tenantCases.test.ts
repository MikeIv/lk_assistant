import { describe, expect, it } from 'vitest'
import type { TenantCase, TenantCaseApiResource } from '#shared/types/tenantCases'
import {
  buildTenantCaseTableRows,
  flattenTenantCasesForTable,
  formatTenantCaseArea,
  getTenantCaseTodayDateInputValue,
  normalizeTenantCase,
  normalizeTenantCaseApplicantPayload,
  normalizeTenantCaseKp,
  normalizeTenantCaseRoom,
  tenantCaseApplicantsToFormLoad,
  tenantCaseToCreatePayload,
  toTenantCaseApiDateTime,
  toTenantCaseDateInputValue,
} from '#shared/utils/tenantCasesNormalize'
import {
  buildTenantCasesPagination,
  isTenantCaseSortKey,
  matchesTenantCaseSearch,
  paginateTenantCases,
  sortTenantCases,
  toTenantCasesApiPagination,
} from '#shared/utils/tenantCasesTable'
import {
  buildTenantCaseStorePayload,
  emptyTenantCaseCreateFieldErrors,
  hasTenantCaseCreateFieldErrors,
  normalizeTenantCaseCreatePayload,
  normalizeTenantCaseStorePayload,
  parseTenantCaseCreateFieldErrors,
  storePayloadToCreatePayload,
  validateTenantCaseFormPayload,
} from '#shared/utils/tenantCasesValidation'

function makeCase(overrides: Partial<TenantCase> = {}): TenantCase {
  const base: TenantCase = {
    id: 10,
    room_id: 1,
    room: { id: 1, category: 'Cat', floor: '2', name: '101', area: 12.5 },
    current_tenant: 'Current',
    responsible: 'Ivan',
    applicants: [
      {
        id: 100,
        tenant_applicant_id: 5,
        tenant_applicant: 'Applicant',
        category: 'Food',
        status: 'переговоры',
        negotiation_status_id: 3,
        negotiation_status: null,
        first_contact_date: '2026-07-01T00:00:00',
        next_contact_date: null,
        negotiations: [{ date: '2026-07-02T00:00:00', info: 'Call' }],
        contacts: 'a@b.ru',
      },
    ],
    table_rows: [],
    kp: { rows: [] },
  }

  const merged = { ...base, ...overrides }
  if (!merged.table_rows.length) {
    merged.table_rows = buildTenantCaseTableRows(
      merged.id,
      merged.room,
      merged.current_tenant,
      merged.responsible,
      merged.applicants,
    )
  }
  return merged
}

describe('tenantCasesNormalize', () => {
  it('normalizes room/kp/dates/area and builds table rows', () => {
    expect(normalizeTenantCaseRoom(null)).toBeNull()
    expect(
      normalizeTenantCaseRoom({
        id: 1,
        category: null as unknown as string,
        floor: null as unknown as string,
        name: null as unknown as string,
        area: undefined as unknown as null,
      }),
    ).toEqual({
      id: 1,
      category: '',
      floor: '',
      name: '',
      area: null,
    })
    expect(normalizeTenantCaseKp(undefined)).toEqual({ rows: [] })
    expect(formatTenantCaseArea(null)).toBe('—')
    expect(formatTenantCaseArea(12.5)).toBe('12,5')
    expect(toTenantCaseApiDateTime('2026-07-01')).toBe('2026-07-01T00:00:00')
    expect(toTenantCaseApiDateTime('2026-07-01T12:00:00')).toBe('2026-07-01T12:00:00')
    expect(toTenantCaseDateInputValue('2026-07-01T00:00:00')).toBe('2026-07-01')
    expect(getTenantCaseTodayDateInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/)

    const rows = buildTenantCaseTableRows(
      7,
      { id: 1, category: 'C', floor: '1', name: 'A', area: 3 },
      'Tenant',
      'Resp',
      [
        {
          id: 1,
          tenant_applicant_id: 2,
          tenant_applicant: 'App',
          category: 'Cat',
          status: 'переговоры',
          negotiation_status_id: 1,
          negotiation_status: null,
          first_contact_date: '2026-07-01',
          next_contact_date: null,
          negotiations: [{ date: '2026-07-02', info: 'Info' }],
          contacts: 'x',
        },
      ],
    )
    expect(rows[0]).toMatchObject({
      number: 7,
      first_contact_date: '01.07.2026',
      negotiations_info: '02.07.2026 Info',
    })
  })

  it('normalizes API resource and payload helpers', () => {
    const resource: TenantCaseApiResource = {
      id: 10,
      room_id: 1,
      room: { id: 1, category: 'C', floor: '1', name: '101', area: 10 },
      current_tenant: 'Cur',
      responsible: null,
      applicants: [
        {
          id: 1,
          tenant_applicant_id: 2,
          tenant_applicant: 'App',
          category: 'Cat',
          status: 'weird',
          negotiation_status_id: 3,
          negotiation_status: null,
          first_contact_date: '2026-07-01',
          next_contact_date: null,
          negotiations: [],
          contacts: ['a', 'b'],
        },
      ],
      kp: { rows: [] },
    }

    const normalized = normalizeTenantCase(resource)
    expect(normalized.applicants[0]?.status).toBe('переговоры')
    expect(normalized.applicants[0]?.contacts).toBe('a, b')
    expect(normalized.table_rows).toHaveLength(1)

    const payload = tenantCaseToCreatePayload(normalized)
    expect(payload.room_id).toBe(1)
    expect(tenantCaseApplicantsToFormLoad(normalized.applicants)[0]?.tenant_applicant).toBe('App')

    expect(
      normalizeTenantCaseApplicantPayload({
        tenant_applicant_id: 1,
        negotiation_status_id: 2,
        first_contact_date: '2026-07-01',
        next_contact_date: '2026-07-05',
        negotiations: [{ date: '2026-07-02', info: '  x  ' }],
      }).negotiations?.[0],
    ).toEqual({ date: '2026-07-02T00:00:00', info: 'x' })

    const flat = flattenTenantCasesForTable([makeCase(), makeCase({ id: 11 })])
    expect(flat[0]?.rowSpan).toBe(1)
    expect(flat).toHaveLength(2)
  })
})

describe('tenantCasesTable', () => {
  it('searches, sorts, paginates like other tables', () => {
    const items = [makeCase({ id: 2 }), makeCase({ id: 1, current_tenant: 'Zed' })]

    expect(isTenantCaseSortKey('number')).toBe(true)
    expect(isTenantCaseSortKey('nope')).toBe(false)
    expect(matchesTenantCaseSearch(items[0]!, '  ')).toBe(true)
    expect(matchesTenantCaseSearch(items[0]!, 'Applicant')).toBe(true)
    expect(matchesTenantCaseSearch(items[0]!, 'zzz')).toBe(false)

    expect(sortTenantCases(items, 'number', 'asc').map((i) => i.id)).toEqual([1, 2])
    expect(buildTenantCasesPagination(0, 2, 0)).toMatchObject({
      currentPage: 1,
      perPage: 1,
      rangeFrom: 0,
    })
    expect(paginateTenantCases(items, 1, 1)).toHaveLength(1)
    expect(
      toTenantCasesApiPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      }).rangeFrom,
    ).toBe(0)
  })
})

describe('tenantCasesValidation', () => {
  it('normalizes create/store payloads and maps 422 errors', () => {
    const create = normalizeTenantCaseCreatePayload({
      room_id: 1,
      responsible_name: '  Ivan  ',
      applicants: [
        {
          tenant_applicant_id: 5,
          negotiation_status_id: 3,
          first_contact_date: '2026-07-01',
          next_contact_date: null,
          negotiations: [{ date: '2026-07-02', info: 'Call' }],
        },
      ],
    })
    expect(create.responsible_name).toBe('Ivan')

    const store = buildTenantCaseStorePayload(create)
    expect(store.tenant_applicant_id).toBe(5)
    expect(store.first_contact_date).toContain('T')
    expect(normalizeTenantCaseStorePayload(store).negotiation_info).toBe('Call')
    expect(storePayloadToCreatePayload(store).applicants).toHaveLength(1)

    expect(
      parseTenantCaseCreateFieldErrors({
        errors: {
          room_id: ['bad room'],
          'applicants.0.tenant_applicant_id': ['bad applicant'],
        },
      }),
    ).toMatchObject({
      room_id: 'bad room',
      applicants: 'bad applicant',
    })
    expect(parseTenantCaseCreateFieldErrors({})).toEqual(emptyTenantCaseCreateFieldErrors())
  })

  it('validates payload and detects field errors', () => {
    const invalid = validateTenantCaseFormPayload({
      room_id: 0,
      responsible_name: null,
      applicants: [],
    })
    expect(hasTenantCaseCreateFieldErrors(invalid)).toBe(true)

    const valid = validateTenantCaseFormPayload({
      room_id: 1,
      responsible_name: 'Ivan',
      applicants: [
        {
          tenant_applicant_id: 5,
          negotiation_status_id: 3,
          first_contact_date: '2026-07-01',
          next_contact_date: null,
          negotiations: [{ date: '2026-07-02', info: 'Call' }],
        },
      ],
    })
    expect(hasTenantCaseCreateFieldErrors(valid)).toBe(false)
  })
})
