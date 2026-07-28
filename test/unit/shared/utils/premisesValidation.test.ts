import { describe, expect, it } from 'vitest'
import {
  emptyPremiseCreateFieldErrors,
  hasPremiseCreateFieldErrors,
  normalizePremiseCreatePayload,
  normalizePremiseFormValues,
  parsePremiseCreateFieldErrors,
  validatePremiseFormPayload,
} from '#shared/utils/premisesValidation'
import { PREMISE_REQUIRED_NAME_MESSAGE } from '#shared/utils/premisesSchema'

describe('premisesValidation', () => {
  it('trims text fields and keeps nullables empty as null', () => {
    expect(
      normalizePremiseCreatePayload({
        room_type_id: 1,
        name: '  A-1  ',
        floor: '  2  ',
        area: 10,
        name_bti: '  ',
        floor_bti: null,
        area_bti: null,
      }),
    ).toEqual({
      room_type_id: 1,
      name: 'A-1',
      floor: '2',
      area: 10,
      name_bti: null,
      floor_bti: null,
      area_bti: null,
    })
  })

  it('parses optional area with comma decimal and blank → null', () => {
    const payload = normalizePremiseFormValues({
      room_type_id: '5',
      name: 'X',
      floor: '',
      area: '12,5',
      name_bti: '',
      floor_bti: '',
      area_bti: '  ',
    })

    expect(payload.area).toBe(12.5)
    expect(payload.area_bti).toBeNull()
    expect(payload.floor).toBeNull()
  })

  it('maps 422 field errors and ignores missing errors object', () => {
    expect(
      parsePremiseCreateFieldErrors({
        errors: { name: ['too long'], area: ['invalid'] },
      }),
    ).toMatchObject({
      name: 'too long',
      area: 'invalid',
      floor: null,
    })

    expect(parsePremiseCreateFieldErrors({ message: 'nope' })).toEqual(
      emptyPremiseCreateFieldErrors(),
    )
  })

  it('validates required fields and reports hasErrors', () => {
    const invalid = validatePremiseFormPayload({
      room_type_id: 0,
      name: '',
      floor: null,
      area: null,
      name_bti: null,
      floor_bti: null,
      area_bti: null,
    })

    expect(invalid.name).toBe(PREMISE_REQUIRED_NAME_MESSAGE)
    expect(hasPremiseCreateFieldErrors(invalid)).toBe(true)
    expect(hasPremiseCreateFieldErrors(emptyPremiseCreateFieldErrors())).toBe(false)

    const valid = validatePremiseFormPayload({
      room_type_id: 1,
      name: 'A-1',
      floor: null,
      area: null,
      name_bti: null,
      floor_bti: null,
      area_bti: null,
    })
    expect(hasPremiseCreateFieldErrors(valid)).toBe(false)
  })
})
