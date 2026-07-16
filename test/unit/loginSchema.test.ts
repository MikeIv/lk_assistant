import { describe, expect, it } from 'vitest'
import {
  LOGIN_EMAIL_INVALID_MESSAGE,
  LOGIN_EMAIL_REQUIRED_MESSAGE,
  LOGIN_PASSWORD_REQUIRED_MESSAGE,
  loginFormSchema,
} from '#shared/utils/loginSchema'

describe('loginFormSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginFormSchema.safeParse({
      email: '  broker@olimp.ru  ',
      password: 'secret',
      remember: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('broker@olimp.ru')
      expect(result.data.remember).toBe(true)
    }
  })

  it('rejects empty email and password', () => {
    const result = loginFormSchema.safeParse({
      email: '   ',
      password: '',
      remember: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      expect(messages).toContain(LOGIN_EMAIL_REQUIRED_MESSAGE)
      expect(messages).toContain(LOGIN_PASSWORD_REQUIRED_MESSAGE)
    }
  })

  it('rejects invalid email format', () => {
    const result = loginFormSchema.safeParse({
      email: 'not-an-email',
      password: 'x',
      remember: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === LOGIN_EMAIL_INVALID_MESSAGE)).toBe(true)
    }
  })
})
