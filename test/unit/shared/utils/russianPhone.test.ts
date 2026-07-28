import { describe, expect, it } from 'vitest'
import {
  extractNationalPhoneDigits,
  formatRussianPhone,
  isRussianPhoneEmpty,
  isValidRussianPhone,
  NATIONAL_PHONE_DIGITS_LENGTH,
  normalizeRussianPhoneValue,
} from '#shared/utils/russianPhone'

describe('russianPhone', () => {
  it('extracts national digits from +7 / 8 / 7 prefixes', () => {
    expect(extractNationalPhoneDigits('+7 (999) 123-45-67')).toBe('9991234567')
    expect(extractNationalPhoneDigits('89991234567')).toBe('9991234567')
    expect(extractNationalPhoneDigits('79991234567')).toBe('9991234567')
    expect(extractNationalPhoneDigits('')).toBe('')
    expect(extractNationalPhoneDigits(null)).toBe('')
  })

  it('formats partial and complete numbers', () => {
    expect(formatRussianPhone('999')).toBe('+7 (999')
    expect(formatRussianPhone('99912')).toBe('+7 (999) 12')
    expect(formatRussianPhone('9991234')).toBe('+7 (999) 123 - 4')
    expect(formatRussianPhone('9991234567')).toBe('+7 (999) 123 - 45 - 67')
    expect(formatRussianPhone('')).toBe('')
  })

  it('validates length and normalizes empty → null', () => {
    expect(isRussianPhoneEmpty('+7')).toBe(true)
    expect(isValidRussianPhone('9991234567')).toBe(true)
    expect(isValidRussianPhone('999')).toBe(false)
    expect(NATIONAL_PHONE_DIGITS_LENGTH).toBe(10)
    expect(normalizeRussianPhoneValue('')).toBeNull()
    expect(normalizeRussianPhoneValue('89991234567')).toBe('+7 (999) 123 - 45 - 67')
  })
})
