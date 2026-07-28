import { describe, expect, it } from 'vitest'
import {
  emptyLegalEntityCreateFieldErrors,
  findLegalEntityDuplicateErrors,
  hasLegalEntityCreateFieldErrors,
  LEGAL_ENTITY_DUPLICATE_INN_MESSAGE,
  LEGAL_ENTITY_DUPLICATE_NAME_MESSAGE,
  normalizeLegalEntityCreatePayload,
  parseLegalEntityCreateFieldErrors,
  validateLegalEntityFormPayload,
} from '#shared/utils/legalEntitiesValidation'
import { LEGAL_ENTITY_REQUIRED_INN_MESSAGE } from '#shared/utils/legalEntitiesSchema'

describe('legalEntitiesValidation', () => {
  it('trims payload and nulls blank kpp', () => {
    expect(
      normalizeLegalEntityCreatePayload({
        legal_entity: '  Acme  ',
        inn: ' 123 ',
        kpp: '  ',
      }),
    ).toEqual({
      legal_entity: 'Acme',
      inn: '123',
      kpp: null,
    })
  })

  it('maps 422 errors and empty when errors absent', () => {
    expect(
      parseLegalEntityCreateFieldErrors({
        errors: { inn: ['bad inn'], kpp: ['bad kpp'] },
      }),
    ).toMatchObject({
      inn: 'bad inn',
      kpp: 'bad kpp',
      legal_entity: null,
    })
    expect(parseLegalEntityCreateFieldErrors({})).toEqual(emptyLegalEntityCreateFieldErrors())
  })

  it('validates required fields', () => {
    const errors = validateLegalEntityFormPayload({
      legal_entity: '',
      inn: '',
      kpp: null,
    })
    expect(errors.inn).toBe(LEGAL_ENTITY_REQUIRED_INN_MESSAGE)
    expect(hasLegalEntityCreateFieldErrors(errors)).toBe(true)
  })

  it('finds duplicate name and inn with excludeId', () => {
    const items = [
      { id: 1, legal_entity: 'Acme', inn: '111' },
      { id: 2, legal_entity: 'Beta', inn: '222' },
    ]

    expect(findLegalEntityDuplicateErrors(items, { legal_entity: 'ACME', inn: '999' })).toEqual({
      legal_entity: LEGAL_ENTITY_DUPLICATE_NAME_MESSAGE,
      inn: null,
      kpp: null,
    })

    expect(findLegalEntityDuplicateErrors(items, { legal_entity: 'X', inn: '222' })).toEqual({
      legal_entity: null,
      inn: LEGAL_ENTITY_DUPLICATE_INN_MESSAGE,
      kpp: null,
    })

    expect(findLegalEntityDuplicateErrors(items, { legal_entity: 'Acme', inn: '111' }, 1)).toEqual(
      emptyLegalEntityCreateFieldErrors(),
    )
  })
})
