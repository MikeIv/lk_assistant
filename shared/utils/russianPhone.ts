export const RUSSIAN_PHONE_PLACEHOLDER = '+7 (___) ___ - __ - __'

export const RUSSIAN_PHONE_INVALID_MESSAGE = 'Укажите корректный номер телефона'

export const NATIONAL_PHONE_DIGITS_LENGTH = 10

export function extractNationalPhoneDigits(value: string | null | undefined): string {
  if (!value?.trim()) {
    return ''
  }

  const trimmed = value.trim()

  if (trimmed.startsWith('+7')) {
    return trimmed.slice(2).replace(/\D/g, '').slice(0, NATIONAL_PHONE_DIGITS_LENGTH)
  }

  let digits = trimmed.replace(/\D/g, '')

  if (digits.length >= 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    digits = digits.slice(1)
  }

  return digits.slice(0, NATIONAL_PHONE_DIGITS_LENGTH)
}

export function formatRussianPhone(value: string | null | undefined): string {
  const national = extractNationalPhoneDigits(value)

  if (!national.length) {
    return ''
  }

  let result = '+7 ('

  result += national.slice(0, 3)

  if (national.length <= 3) {
    return result
  }

  result += ') '
  result += national.slice(3, 6)

  if (national.length <= 6) {
    return result
  }

  result += ' - '
  result += national.slice(6, 8)

  if (national.length <= 8) {
    return result
  }

  result += ' - '
  result += national.slice(8, 10)

  return result
}

export function isRussianPhoneEmpty(value: string | null | undefined): boolean {
  return extractNationalPhoneDigits(value).length === 0
}

export function isValidRussianPhone(value: string | null | undefined): boolean {
  return extractNationalPhoneDigits(value).length === NATIONAL_PHONE_DIGITS_LENGTH
}

export function normalizeRussianPhoneValue(value: string | null | undefined): string | null {
  if (isRussianPhoneEmpty(value)) {
    return null
  }

  return formatRussianPhone(value)
}
