import type { CabinetRole } from '#shared/types/cabinet'

/**
 * Identity из access JWT (claims без verify).
 * UI-роль ЛК — двухуровневая; серверная авторизация по-прежнему на API.
 */
export interface BrokerJwtIdentity {
  role: CabinetRole
  roleId: number | null
  roleLabel: string | null
  fullName: string | null
  sub: string | null
}

/** Подтверждено spike: role_id=2 — «Руководитель брокеров». */
const ADMIN_ROLE_IDS = new Set([2])

/** Запасной матч по названию роли (нижний регистр). */
const ADMIN_ROLE_NAME_MARKERS = ['руководитель', 'администратор', 'admin'] as const

const EMPTY_IDENTITY: BrokerJwtIdentity = {
  role: 'user',
  roleId: null,
  roleLabel: null,
  fullName: null,
  sub: null,
}

function isAdminRole(roleId: number | null, roleLabel: string | null): boolean {
  if (roleId !== null && ADMIN_ROLE_IDS.has(roleId)) {
    return true
  }

  if (!roleLabel) {
    return false
  }

  const normalized = roleLabel.toLocaleLowerCase('ru')
  return ADMIN_ROLE_NAME_MARKERS.some((marker) => normalized.includes(marker))
}

export function mapCabinetRoleFromJwtClaims(
  claims: Record<string, unknown> | null,
): BrokerJwtIdentity {
  if (!claims) {
    return { ...EMPTY_IDENTITY }
  }

  const roleId = typeof claims.role_id === 'number' ? claims.role_id : null
  const roleLabel = typeof claims.role === 'string' ? claims.role : null
  const fullName = typeof claims.full_name === 'string' ? claims.full_name : null
  const sub = claims.sub === undefined || claims.sub === null ? null : String(claims.sub)

  return {
    role: isAdminRole(roleId, roleLabel) ? 'admin' : 'user',
    roleId,
    roleLabel,
    fullName,
    sub,
  }
}
