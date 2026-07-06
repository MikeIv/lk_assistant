import type {
  TenantCase,
  TenantCaseApiResource,
  TenantCaseApplicant,
  TenantCaseApplicantPayload,
  TenantCaseCreatePayload,
  TenantCaseNegotiation,
  TenantCaseRoom,
  TenantCaseTableRow,
} from '#shared/types/tenantCases'

function formatDisplayDate(value: string | null): string | null {
  if (!value) {
    return null
  }

  const datePart = value.slice(0, 10)
  const [year, month, day] = datePart.split('-')

  if (!year || !month || !day) {
    return value
  }

  return `${day}.${month}.${year}`
}

function formatNegotiationsInfo(negotiations: TenantCaseNegotiation[]): string {
  return negotiations
    .map((item) => {
      const dateLabel = item.date ? formatDisplayDate(item.date) : null
      const info = item.info?.trim() ?? ''

      if (dateLabel && info) {
        return `${dateLabel} ${info}`
      }

      return info || dateLabel || ''
    })
    .filter(Boolean)
    .join('\n')
}

export function buildTenantCaseTableRows(
  caseId: number,
  room: TenantCaseRoom | null,
  currentTenant: string,
  responsible: string | null,
  applicants: TenantCaseApplicant[],
): TenantCaseTableRow[] {
  return applicants.map((applicant) => ({
    number: caseId,
    floor: room?.floor ?? '',
    room: room?.name ?? '',
    area_m2: room?.area ?? null,
    current_tenant: currentTenant,
    tenant_applicant: applicant.tenant_applicant,
    category: applicant.category,
    status: applicant.status,
    first_contact_date: formatDisplayDate(applicant.first_contact_date),
    next_contact_date: formatDisplayDate(applicant.next_contact_date),
    negotiations_info: formatNegotiationsInfo(applicant.negotiations),
    contacts: applicant.contacts,
    responsible,
  }))
}

export function normalizeTenantCaseApplicant(item: TenantCaseApplicant): TenantCaseApplicant {
  return {
    id: item.id,
    tenant_applicant_id: item.tenant_applicant_id,
    tenant_applicant: item.tenant_applicant,
    category: item.category,
    status: item.status,
    first_contact_date: item.first_contact_date,
    next_contact_date: item.next_contact_date ?? null,
    negotiations: Array.isArray(item.negotiations) ? item.negotiations : [],
    contacts: typeof item.contacts === 'string' ? item.contacts : '',
  }
}

export function normalizeTenantCase(item: TenantCaseApiResource): TenantCase {
  const room = item.room ?? null
  const applicants = (item.applicants ?? []).map(normalizeTenantCaseApplicant)
  const tableRows = item.table_rows?.length
    ? item.table_rows
    : buildTenantCaseTableRows(
        item.id,
        room,
        item.current_tenant,
        item.responsible ?? null,
        applicants,
      )

  return {
    id: item.id,
    room_id: item.room_id,
    room,
    current_tenant: item.current_tenant,
    responsible: item.responsible ?? null,
    applicants,
    table_rows: tableRows,
  }
}

export function tenantCaseToCreatePayload(tenantCase: TenantCase): TenantCaseCreatePayload {
  return {
    room_id: tenantCase.room_id,
    responsible_name: tenantCase.responsible,
    applicants: tenantCase.applicants.map((applicant) => ({
      tenant_applicant_id: applicant.tenant_applicant_id,
      status: applicant.status,
      first_contact_date: applicant.first_contact_date,
      next_contact_date: applicant.next_contact_date,
      negotiations: applicant.negotiations.length ? applicant.negotiations : null,
    })),
  }
}

export function flattenTenantCasesForTable(
  cases: TenantCase[],
): Array<TenantCaseTableRow & { caseId: number; rowSpan: number }> {
  const rows: Array<TenantCaseTableRow & { caseId: number; rowSpan: number }> = []

  for (const tenantCase of cases) {
    const tableRows = tenantCase.table_rows.length
      ? tenantCase.table_rows
      : buildTenantCaseTableRows(
          tenantCase.id,
          tenantCase.room,
          tenantCase.current_tenant,
          tenantCase.responsible,
          tenantCase.applicants,
        )

    const rowSpan = Math.max(tableRows.length, 1)

    if (!tableRows.length) {
      rows.push({
        caseId: tenantCase.id,
        rowSpan,
        number: tenantCase.id,
        floor: tenantCase.room?.floor ?? '',
        room: tenantCase.room?.name ?? '',
        area_m2: tenantCase.room?.area ?? null,
        current_tenant: tenantCase.current_tenant,
        tenant_applicant: '',
        category: '',
        status: '',
        first_contact_date: null,
        next_contact_date: null,
        negotiations_info: '',
        contacts: '',
        responsible: tenantCase.responsible,
      })
      continue
    }

    tableRows.forEach((row, index) => {
      rows.push({
        ...row,
        caseId: tenantCase.id,
        rowSpan: index === 0 ? rowSpan : 0,
      })
    })
  }

  return rows
}

export function formatTenantCaseArea(value: number | null): string {
  if (value === null) {
    return '—'
  }

  return String(value).replace('.', ',')
}

export function toTenantCaseApiDateTime(dateValue: string): string {
  const trimmed = dateValue.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.includes('T')) {
    return trimmed
  }

  return `${trimmed}T00:00:00`
}

export function toTenantCaseDateInputValue(value: string | null): string {
  if (!value) {
    return ''
  }

  return value.slice(0, 10)
}

export function normalizeTenantCaseApplicantPayload(
  applicant: TenantCaseApplicantPayload,
): TenantCaseApplicantPayload {
  return {
    tenant_applicant_id: applicant.tenant_applicant_id,
    status: applicant.status,
    first_contact_date: toTenantCaseApiDateTime(applicant.first_contact_date),
    next_contact_date: applicant.next_contact_date
      ? toTenantCaseApiDateTime(applicant.next_contact_date)
      : null,
    negotiations: applicant.negotiations?.length ? applicant.negotiations : null,
  }
}
