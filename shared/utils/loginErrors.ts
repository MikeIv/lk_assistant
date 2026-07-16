import type { FetchError } from 'ofetch'

const FALLBACK_MESSAGE = 'Не удалось войти. Попробуйте ещё раз.'

function isFetchError(error: unknown): error is FetchError {
  return Boolean(error && typeof error === 'object' && 'response' in error)
}

function messageFromData(data: unknown): string | null {
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return null
  }

  const message = (data as { message: unknown }).message
  return typeof message === 'string' && message.trim() ? message.trim() : null
}

/** Сообщение об ошибке login для UI (без stack / токенов). */
export function getLoginErrorMessage(error: unknown): string {
  if (!isFetchError(error)) {
    return FALLBACK_MESSAGE
  }

  const fromBody = messageFromData(error.data)
  if (fromBody) {
    return fromBody
  }

  const status = error.response?.status ?? error.statusCode
  if (status === 401) {
    return 'Неверный логин или пароль'
  }

  if (status === 422) {
    return 'Проверьте введённые данные'
  }

  return FALLBACK_MESSAGE
}
