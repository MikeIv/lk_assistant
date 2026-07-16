import type { ApiSuccessResponse, LoginResponse } from '#shared/types/api'

/** Успешный ответ login/refresh для моков `$fetch`. */
export function loginSuccess(accessToken: string): ApiSuccessResponse<LoginResponse> {
  return {
    success: true,
    message: 'ok',
    payload: {
      access_token: accessToken,
      refresh_token: 'cookie-only',
    },
  }
}
