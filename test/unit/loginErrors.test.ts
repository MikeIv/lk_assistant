import { describe, expect, it } from 'vitest'
import { getLoginErrorMessage } from '#shared/utils/loginErrors'

function fetchError(partial: { status?: number; statusCode?: number; data?: unknown }): {
  response?: { status: number }
  statusCode?: number
  data?: unknown
} {
  return {
    response: partial.status !== undefined ? { status: partial.status } : undefined,
    statusCode: partial.statusCode,
    data: partial.data,
  }
}

describe('getLoginErrorMessage', () => {
  it('returns fallback for non-fetch errors', () => {
    expect(getLoginErrorMessage(new Error('boom'))).toBe('Не удалось войти. Попробуйте ещё раз.')
    expect(getLoginErrorMessage(null)).toBe('Не удалось войти. Попробуйте ещё раз.')
  })

  it('prefers short message from response body', () => {
    expect(
      getLoginErrorMessage(
        fetchError({ status: 401, data: { message: '  Учётная запись заблокирована  ' } }),
      ),
    ).toBe('Учётная запись заблокирована')
  })

  it('ignores oversized or non-string body messages', () => {
    expect(
      getLoginErrorMessage(fetchError({ status: 401, data: { message: 'x'.repeat(200) } })),
    ).toBe('Неверный логин или пароль')
    expect(getLoginErrorMessage(fetchError({ status: 401, data: { message: 42 } }))).toBe(
      'Неверный логин или пароль',
    )
  })

  it('maps 401 and 422 when body has no usable message', () => {
    expect(getLoginErrorMessage(fetchError({ status: 401 }))).toBe('Неверный логин или пароль')
    expect(getLoginErrorMessage(fetchError({ statusCode: 422 }))).toBe('Проверьте введённые данные')
  })

  it('falls back for other statuses', () => {
    expect(getLoginErrorMessage(fetchError({ status: 500 }))).toBe(
      'Не удалось войти. Попробуйте ещё раз.',
    )
  })
})
