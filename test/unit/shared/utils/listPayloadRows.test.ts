import { describe, expect, it } from 'vitest'
import { listPayloadRows } from '#shared/utils/listPayloadRows'

describe('listPayloadRows', () => {
  it('prefers data over items, accepts array, and falls back safely', () => {
    expect(listPayloadRows([{ id: 3 }])).toEqual([{ id: 3 }])
    expect(listPayloadRows({ data: [{ id: 1 }], items: [{ id: 2 }] })).toEqual([{ id: 1 }])
    expect(listPayloadRows({ items: [{ id: 2 }] })).toEqual([{ id: 2 }])
    expect(listPayloadRows({})).toEqual([])
    expect(listPayloadRows(null)).toEqual([])
    expect(
      listPayloadRows({ data: 'bad', items: [{ id: 4 }] } as {
        data?: { id: number }[]
        items?: { id: number }[]
      }),
    ).toEqual([{ id: 4 }])
  })
})
