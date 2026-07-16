/**
 * Decode JWT payload without signature verification (client UX only).
 * Не использовать для security decisions на сервере.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  const segment = parts[1]
  if (!segment) {
    return null
  }

  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const payload = JSON.parse(json) as unknown
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Access истёк или истекает в пределах skewSeconds. */
export function isAccessTokenExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (typeof exp !== 'number') {
    return true
  }
  return exp * 1000 <= Date.now() + skewSeconds * 1000
}
