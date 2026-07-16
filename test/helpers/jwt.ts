/** Unsigned JWT for client-side decode/expiry tests (no signature verify). */
export function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${header}.${body}.sig`
}

export function makeAccessToken(overrides: Record<string, unknown> = {}): string {
  const exp = Math.floor(Date.now() / 1000) + 3600
  return makeJwt({
    sub: '42',
    role_id: 1,
    role: 'Брокер',
    full_name: 'Иван Тестов',
    exp,
    ...overrides,
  })
}
