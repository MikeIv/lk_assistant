import type { TenantCaseApplicantStatus } from '#shared/types/tenantCases'
import { NEGOTIATION_STATUSES_MOCK_ITEMS } from '#shared/constants/negotiationStatusesMock'
import { APPLICANTS_MOCK_ITEMS } from '#shared/constants/applicantsMock'
import { PREMISES_MOCK_ITEMS } from '#shared/constants/premisesMock'
import { buildTenantCaseTableRows } from '#shared/utils/tenantCasesNormalize'

const CURRENT_TENANTS = [
  'Funny Socks',
  'Coffee House',
  'Sport Line',
  'Beauty Lab',
  'Tech Store',
  'Kids World',
  'Book Corner',
] as const

const RESPONSIBLES = ['Елена', 'Анна', 'Михаил', 'Ольга', null] as const

const STATUSES: TenantCaseApplicantStatus[] = ['переговоры', 'отказ', 'отказ с нашей стороны']

function formatIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`
}

function buildApplicant(index: number, caseId: number, applicantIndex: number) {
  const applicant = APPLICANTS_MOCK_ITEMS[(index + applicantIndex) % APPLICANTS_MOCK_ITEMS.length]!
  const status = STATUSES[(index + applicantIndex) % STATUSES.length]!
  const contact = applicant.contacts[0]
  const negotiationStatus =
    NEGOTIATION_STATUSES_MOCK_ITEMS.find((item) => item.status === status) ??
    NEGOTIATION_STATUSES_MOCK_ITEMS[0]!

  return {
    id: caseId * 100 + applicantIndex + 1,
    tenant_applicant_id: applicant.id,
    tenant_applicant: applicant.title,
    category: applicant.category_name ?? '—',
    status,
    negotiation_status_id: negotiationStatus.id,
    negotiation_status: negotiationStatus,
    first_contact_date: formatIsoDate(2025, 1 + (index % 6), 5 + (applicantIndex % 20)),
    next_contact_date:
      status === 'переговоры'
        ? formatIsoDate(2025, 2 + (index % 5), 10 + (applicantIndex % 15))
        : null,
    negotiations: [
      {
        date: formatIsoDate(2025, 2, 6 + applicantIndex),
        info:
          status === 'отказ'
            ? 'отказ. Пока не интересен проект'
            : 'первичный контакт, обсуждение условий',
      },
    ],
    contacts: [contact?.name, contact?.phone_number, contact?.email].filter(Boolean).join(', '),
  }
}

function buildMockTenantCase(index: number): TenantCase {
  const id = index + 1
  const premise = PREMISES_MOCK_ITEMS[index % PREMISES_MOCK_ITEMS.length]!
  const applicantsCount = index === 17 ? 10 : (index % 4) + 1
  const room = {
    id: String(premise.id),
    category: premise.room_type ?? '',
    floor: premise.floor ?? '',
    name: premise.name,
    area: premise.area,
  }

  const applicants = Array.from({ length: applicantsCount }, (_, applicantIndex) =>
    buildApplicant(index, id, applicantIndex),
  )

  const responsible = RESPONSIBLES[index % RESPONSIBLES.length] ?? null
  const currentTenant = CURRENT_TENANTS[index % CURRENT_TENANTS.length] ?? 'Арендатор'

  const tenantCase: TenantCase = {
    id,
    room_id: premise.id,
    room,
    current_tenant: currentTenant,
    responsible,
    applicants,
    table_rows: [],
    kp: { rows: [] },
  }

  tenantCase.table_rows = buildTenantCaseTableRows(id, room, currentTenant, responsible, applicants)

  return tenantCase
}

/** 48 дел — для проверки пагинации, поиска и группировки строк в mock-режиме. */
export const TENANT_CASES_MOCK_ITEMS: TenantCase[] = Array.from({ length: 48 }, (_, index) =>
  buildMockTenantCase(index),
)
