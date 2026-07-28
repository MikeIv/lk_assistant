import { describe, expect, it } from 'vitest'
import {
  CATEGORY_DUPLICATE_NAME_MESSAGE,
  emptyCategoryCreateFieldErrors,
  findCategoryDuplicateErrors,
  hasCategoryCreateFieldErrors,
  normalizeCategoryCreatePayload,
  parseCategoryCreateFieldErrors,
  validateCategoryFormPayload,
} from '#shared/utils/categoriesValidation'
import {
  emptyNegotiationStatusCreateFieldErrors,
  findNegotiationStatusDuplicateErrors,
  hasNegotiationStatusCreateFieldErrors,
  NEGOTIATION_STATUS_DUPLICATE_NAME_MESSAGE,
  normalizeNegotiationStatusCreatePayload,
  parseNegotiationStatusCreateFieldErrors,
  validateNegotiationStatusFormPayload,
} from '#shared/utils/negotiationStatusesValidation'
import {
  emptyRoomTypeCreateFieldErrors,
  findRoomTypeDuplicateErrors,
  hasRoomTypeCreateFieldErrors,
  normalizeRoomTypeCreatePayload,
  parseRoomTypeCreateFieldErrors,
  ROOM_TYPE_DUPLICATE_NAME_MESSAGE,
  validateRoomTypeFormPayload,
} from '#shared/utils/roomTypesValidation'

type NameOnlyContract = {
  name: string
  duplicateMessage: string
  normalize: (payload: { name: string }) => { name: string }
  empty: () => { name: string | null }
  parse: (data: unknown) => { name: string | null }
  hasErrors: (errors: { name: string | null }) => boolean
  validate: (payload: { name: string }) => { name: string | null }
  findDuplicate: (
    items: Array<{ id?: number; name: string }>,
    payload: { name: string },
    excludeId?: number,
  ) => { name: string | null }
}

const contracts: NameOnlyContract[] = [
  {
    name: 'categories',
    duplicateMessage: CATEGORY_DUPLICATE_NAME_MESSAGE,
    normalize: normalizeCategoryCreatePayload,
    empty: emptyCategoryCreateFieldErrors,
    parse: parseCategoryCreateFieldErrors,
    hasErrors: hasCategoryCreateFieldErrors,
    validate: validateCategoryFormPayload,
    findDuplicate: findCategoryDuplicateErrors,
  },
  {
    name: 'roomTypes',
    duplicateMessage: ROOM_TYPE_DUPLICATE_NAME_MESSAGE,
    normalize: normalizeRoomTypeCreatePayload,
    empty: emptyRoomTypeCreateFieldErrors,
    parse: parseRoomTypeCreateFieldErrors,
    hasErrors: hasRoomTypeCreateFieldErrors,
    validate: validateRoomTypeFormPayload,
    findDuplicate: findRoomTypeDuplicateErrors,
  },
  {
    name: 'negotiationStatuses',
    duplicateMessage: NEGOTIATION_STATUS_DUPLICATE_NAME_MESSAGE,
    normalize: normalizeNegotiationStatusCreatePayload,
    empty: emptyNegotiationStatusCreateFieldErrors,
    parse: parseNegotiationStatusCreateFieldErrors,
    hasErrors: hasNegotiationStatusCreateFieldErrors,
    validate: validateNegotiationStatusFormPayload,
    findDuplicate: findNegotiationStatusDuplicateErrors,
  },
]

describe.each(contracts)('directories name-only *Validation: $name', (contract) => {
  it('trims normalize payload', () => {
    expect(contract.normalize({ name: '  Foo  ' })).toEqual({ name: 'Foo' })
  })

  it('maps 422 errors and returns empty when errors missing', () => {
    expect(contract.parse({ errors: { name: ['bad'] } }).name).toBe('bad')
    expect(contract.parse({ message: 'fail' })).toEqual(contract.empty())
    expect(contract.parse({})).toEqual(contract.empty())
  })

  it('detects field errors presence', () => {
    expect(contract.hasErrors(contract.empty())).toBe(false)
    expect(contract.hasErrors({ name: 'x' })).toBe(true)
  })

  it('validates required name', () => {
    expect(contract.validate({ name: '' }).name).toBeTruthy()
    expect(contract.validate({ name: 'Ok' }).name).toBeNull()
  })

  it('finds duplicates case-insensitively and respects excludeId', () => {
    const items = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ]

    expect(contract.findDuplicate(items, { name: '  ALPHA ' }).name).toBe(contract.duplicateMessage)
    expect(contract.findDuplicate(items, { name: 'Alpha' }, 1).name).toBeNull()
    expect(contract.findDuplicate(items, { name: 'Gamma' }).name).toBeNull()
  })
})
