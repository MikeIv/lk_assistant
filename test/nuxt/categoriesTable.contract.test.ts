import { describe, expect, it } from 'vitest'
import type { CategoriesPagination, Category } from '#shared/types/categories'
import { mountUi } from '../helpers/mountUi'
import CategoriesTable from '~/components/direct/categories/Table.vue'

const pagination: CategoriesPagination = {
  currentPage: 1,
  lastPage: 2,
  perPage: 10,
  total: 12,
  rangeFrom: 1,
  rangeTo: 10,
}

const items: Category[] = [
  { id: 1, name: 'Категория A' },
  { id: 2, name: 'Категория B' },
]

function mountTable(overrides: Record<string, unknown> = {}) {
  return mountUi(CategoriesTable, {
    props: {
      items,
      pagination,
      searchQuery: '',
      sortKey: 'id',
      sortDirection: 'asc',
      perPage: 10,
      loading: false,
      ...overrides,
    },
    global: {
      stubs: {
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

describe('direct/categories/Table (directory table contract)', () => {
  it('renders rows and empty state', async () => {
    const withRows = await mountTable()
    expect(withRows.text()).toContain('Категория A')
    expect(withRows.text()).toContain('Категория B')

    const empty = await mountTable({ items: [] })
    expect(empty.text()).toContain('Нет данных для отображения')
  })

  it('emits search, sort, create, rowClick, perPage and pageChange', async () => {
    const wrapper = await mountTable()

    await wrapper.get('input[type="search"]').setValue('кат')
    expect(wrapper.emitted('update:searchQuery')?.at(-1)).toEqual(['кат'])

    const sortButtons = wrapper.findAll('thead button')
    await sortButtons[1]!.trigger('click')
    expect(wrapper.emitted('sortChange')?.at(-1)).toEqual(['name'])

    const createButton = wrapper.findAll('button').find((btn) => btn.text() === 'Создать')
    expect(createButton).toBeTruthy()
    await createButton!.trigger('click')
    expect(wrapper.emitted('create')?.length).toBe(1)

    await wrapper.findAll('tbody tr')[0]!.trigger('click')
    expect(wrapper.emitted('rowClick')?.at(-1)).toEqual([items[0]])

    await wrapper.get('#categories-per-page').setValue('25')
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
