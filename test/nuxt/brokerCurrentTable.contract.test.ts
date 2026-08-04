import { describe, expect, it } from 'vitest'
import type { TenantCase, TenantCasesPagination } from '#shared/types/tenantCases'
import { buildTenantCaseTableRows } from '#shared/utils/tenantCasesNormalize'
import { mountUi } from '../helpers/mountUi'
import BrokerCurrentTable from '~/components/broker/current/Table.vue'

const pagination: TenantCasesPagination = {
  currentPage: 1,
  lastPage: 2,
  perPage: 10,
  total: 12,
  rangeFrom: 1,
  rangeTo: 10,
}

function makeCase(overrides: Partial<TenantCase> = {}): TenantCase {
  const room = { id: '1', category: 'Торговое', floor: '2', name: '101', area: 42 }
  const applicants = [
    {
      id: 100,
      tenant_applicant_id: 5,
      tenant_applicant: 'Coffee House',
      category: 'Общепит',
      status: 'переговоры' as const,
      negotiation_status_id: 1,
      negotiation_status: null,
      first_contact_date: '2026-07-01T00:00:00',
      next_contact_date: null,
      negotiations: [{ date: '2026-07-02T00:00:00', info: 'Звонок' }],
      contacts: 'a@b.ru',
    },
  ]

  const base: TenantCase = {
    id: 7,
    room_id: 1,
    room,
    current_tenant: 'Funny Socks',
    responsible_id: 9,
    responsible: 'Иван',
    applicants,
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

const items = [makeCase()]

function mountTable(overrides: Record<string, unknown> = {}) {
  return mountUi(BrokerCurrentTable, {
    props: {
      items,
      pagination,
      searchQuery: '',
      sortKey: 'number',
      sortDirection: 'asc',
      perPage: 10,
      loading: false,
      ...overrides,
    },
    global: {
      stubs: {
        NuxtLink: {
          name: 'NuxtLink',
          props: ['to'],
          template: '<a :href="to"><slot /></a>',
        },
        UiButton: {
          name: 'UiButton',
          props: ['label'],
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')">{{ label }}</button>',
        },
        ReportsTablePagination: {
          name: 'ReportsTablePagination',
          props: ['currentPage', 'lastPage'],
          emits: ['pageChange'],
          template:
            '<nav data-testid="pagination">' +
            '<button type="button" data-testid="page-2" @click="$emit(\'pageChange\', 2)">2</button>' +
            '</nav>',
        },
      },
    },
  })
}

describe('broker/current/Table (tenant cases table contract)', () => {
  it('renders rows, open link and empty state', async () => {
    const withRows = await mountTable()
    expect(withRows.text()).toContain('Funny Socks')
    expect(withRows.text()).toContain('Coffee House')
    expect(withRows.get('a[href="/broker/current/7"]').text()).toContain('открыть')

    const empty = await mountTable({ items: [] })
    expect(empty.text()).toContain('Нет данных для отображения')
  })

  it('emits search, sort, create, perPage and pageChange', async () => {
    const wrapper = await mountTable()

    await wrapper.get('input[type="search"]').setValue('socks')
    expect(wrapper.emitted('update:searchQuery')?.at(-1)).toEqual(['socks'])

    const sortButtons = wrapper.findAll('thead button')
    await sortButtons[0]!.trigger('click')
    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual(['number'])

    const createButton = wrapper.findAll('button').find((btn) => btn.text() === 'Создать')
    expect(createButton).toBeTruthy()
    await createButton!.trigger('click')
    expect(wrapper.emitted('create')?.length).toBe(1)

    await wrapper.get('#tenant-cases-per-page').setValue('25')
    expect(wrapper.emitted('perPageChange')?.at(-1)).toEqual([25])

    await wrapper.get('[data-testid="page-2"]').trigger('click')
    expect(wrapper.emitted('pageChange')?.at(-1)).toEqual([2])
  })

  it('shows loading overlay when loading', async () => {
    const wrapper = await mountTable({ loading: true })
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('shows pagination range text', async () => {
    const wrapper = await mountTable()
    expect(wrapper.text()).toContain('Показано с 1 по 10 из 12')
  })
})
