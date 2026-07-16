import type { CabinetRole } from '#shared/types/cabinet'
import { mapCabinetRoleFromJwtClaims } from '#shared/utils/cabinetRoleFromJwt'
import { decodeJwtPayload } from '#shared/utils/jwtPayload'
import { useAuthToken } from '~/composables/useAuthToken'

const ROLE_STATE_KEY = 'cabinet-role'
const ROLE_LABEL_STATE_KEY = 'cabinet-role-label'
const FULL_NAME_STATE_KEY = 'cabinet-full-name'

let roleWatchBound = false

/**
 * Роль ЛК из access JWT (`role_id` / `role`).
 * Default fail-closed: `'user'`. Сброс при logout / отсутствии токена.
 */
export function useCabinetRole() {
  const { accessToken, hydrateFromStorage } = useAuthToken()

  const role = useState<CabinetRole>(ROLE_STATE_KEY, () => 'user')
  const roleLabel = useState<string | null>(ROLE_LABEL_STATE_KEY, () => null)
  const fullName = useState<string | null>(FULL_NAME_STATE_KEY, () => null)

  function syncFromAccessToken() {
    hydrateFromStorage()

    const token = accessToken.value
    if (!token) {
      role.value = 'user'
      roleLabel.value = null
      fullName.value = null
      return
    }

    const identity = mapCabinetRoleFromJwtClaims(decodeJwtPayload(token))
    role.value = identity.role
    roleLabel.value = identity.roleLabel
    fullName.value = identity.fullName
  }

  syncFromAccessToken()

  if (import.meta.client && !roleWatchBound) {
    roleWatchBound = true
    watch(accessToken, () => {
      syncFromAccessToken()
    })
  }

  const isAdmin = computed(() => role.value === 'admin')

  return {
    role: readonly(role),
    roleLabel: readonly(roleLabel),
    fullName: readonly(fullName),
    isAdmin,
  }
}
