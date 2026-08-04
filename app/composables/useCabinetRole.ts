import type { CabinetRole } from '#shared/types/cabinet'
import { mapCabinetRoleFromJwtClaims } from '#shared/utils/cabinetRoleFromJwt'
import { decodeJwtPayload } from '#shared/utils/jwtPayload'
import { useAuthToken } from '~/composables/useAuthToken'

const ROLE_STATE_KEY = 'cabinet-role'
const ROLE_LABEL_STATE_KEY = 'cabinet-role-label'
const FULL_NAME_STATE_KEY = 'cabinet-full-name'
const USER_ID_STATE_KEY = 'cabinet-user-id'

let stopRoleWatch: ReturnType<typeof watch> | null = null

/** Сброс watch на accessToken между Vitest-кейсами. */
export function resetCabinetRoleWatchForTests() {
  stopRoleWatch?.()
  stopRoleWatch = null
}

/**
 * Роль ЛК из access JWT (`role_id` / `role` / `sub`).
 * Default fail-closed: `'user'`. Сброс при logout / отсутствии токена.
 */
export function useCabinetRole() {
  const { accessToken, hydrateFromStorage } = useAuthToken()

  const role = useState<CabinetRole>(ROLE_STATE_KEY, () => 'user')
  const roleLabel = useState<string | null>(ROLE_LABEL_STATE_KEY, () => null)
  const fullName = useState<string | null>(FULL_NAME_STATE_KEY, () => null)
  const userId = useState<string | null>(USER_ID_STATE_KEY, () => null)

  function syncFromAccessToken() {
    hydrateFromStorage()

    const token = accessToken.value
    if (!token) {
      role.value = 'user'
      roleLabel.value = null
      fullName.value = null
      userId.value = null
      return
    }

    const identity = mapCabinetRoleFromJwtClaims(decodeJwtPayload(token))
    role.value = identity.role
    roleLabel.value = identity.roleLabel
    fullName.value = identity.fullName
    userId.value = identity.sub
  }

  syncFromAccessToken()

  if (import.meta.client && !stopRoleWatch) {
    stopRoleWatch = watch(accessToken, () => {
      syncFromAccessToken()
    })
  }

  const isAdmin = computed(() => role.value === 'admin')

  return {
    role: readonly(role),
    roleLabel: readonly(roleLabel),
    fullName: readonly(fullName),
    /** JWT `sub` — для `user_id` в list дел. */
    userId: readonly(userId),
    isAdmin,
  }
}
