import type { FetchError } from 'ofetch'

const FALLBACK_MESSAGE = 'Не удалось войти. Попробуйте ещё раз.'
const MAX_MESSAGE_LENGTH = 180

function isFetchError(error: unknown): error is FetchError {
  return Boolean(error && typeof error === 'object' && 'response' in error)
}

/** Берёт только короткое user-facing `message` из тела ответа (без exception/trace). */
function messageFromData(data: unknown): string | null {
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return null
  }

  const message = (data as { message: unknown }).message
  if (typeof message !== 'string') {
    return null
  }

  const trimmed = message.trim()
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
    return null
  }

  return trimmed
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
