import { describe, expect, it } from 'vitest'
import { listPayloadRows } from '#shared/utils/listPayloadRows'

describe('listPayloadRows', () => {
  it('prefers data over items and falls back safely', () => {
    expect(listPayloadRows({ data: [{ id: 1 }], items: [{ id: 2 }] })).toEqual([{ id: 1 }])
    expect(listPayloadRows({ items: [{ id: 2 }] })).toEqual([{ id: 2 }])
    expect(listPayloadRows({})).toEqual([])
    expect(listPayloadRows(null)).toEqual([])
  })
})
