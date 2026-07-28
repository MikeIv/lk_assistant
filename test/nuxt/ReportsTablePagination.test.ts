import { describe, expect, it } from 'vitest'
import { mountUi } from '../helpers/mountUi'
import ReportsTablePagination from '~/components/reports/ReportsTablePagination.vue'

describe('ReportsTablePagination', () => {
  it('emits pageChange for numbered pages and next/prev', async () => {
    const wrapper = await mountUi(ReportsTablePagination, {
      props: { currentPage: 2, lastPage: 5 },
    })

    await wrapper.get('button[aria-label="Следующая страница"]').trigger('click')
    expect(wrapper.emitted('pageChange')?.at(-1)).toEqual([3])

    await wrapper.get('button[aria-label="Предыдущая страница"]').trigger('click')
    expect(wrapper.emitted('pageChange')?.at(-1)).toEqual([1])

    const pageButtons = wrapper.findAll('button').filter((btn) => /^\d+$/.test(btn.text()))
    await pageButtons.find((btn) => btn.text() === '5')!.trigger('click')
    expect(wrapper.emitted('pageChange')?.at(-1)).toEqual([5])
  })

  it('disables prev on first page and next on last page', async () => {
    const first = await mountUi(ReportsTablePagination, {
      props: { currentPage: 1, lastPage: 3 },
    })
    expect(
      first.get('button[aria-label="Предыдущая страница"]').attributes('disabled'),
    ).toBeDefined()

    await first.get('button[aria-label="Предыдущая страница"]').trigger('click')
    expect(first.emitted('pageChange')).toBeUndefined()

    const last = await mountUi(ReportsTablePagination, {
      props: { currentPage: 3, lastPage: 3 },
    })
    expect(last.get('button[aria-label="Следующая страница"]').attributes('disabled')).toBeDefined()

    await last.get('button[aria-label="Следующая страница"]').trigger('click')
    expect(last.emitted('pageChange')).toBeUndefined()
  })

  it('does not emit pageChange for ellipsis', async () => {
    const wrapper = await mountUi(ReportsTablePagination, {
      props: { currentPage: 5, lastPage: 20 },
    })

    const ellipsis = wrapper.findAll('button').find((btn) => btn.text() === '⋯')
    expect(ellipsis).toBeTruthy()
    expect(ellipsis!.attributes('disabled')).toBeDefined()

    await ellipsis!.trigger('click')
    expect(wrapper.emitted('pageChange')).toBeUndefined()
  })

  it('marks current page with aria-current', async () => {
    const wrapper = await mountUi(ReportsTablePagination, {
      props: { currentPage: 2, lastPage: 4 },
    })

    const current = wrapper.findAll('button').find((btn) => btn.text() === '2')
    expect(current?.attributes('aria-current')).toBe('page')
  })
})
