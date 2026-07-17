import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { makeAccessToken } from '../helpers/jwt'
import { resetAuthClientState } from './resetAuthClientState'
import { useAuthToken } from '~/composables/useAuthToken'
import { useCabinetRole } from '~/composables/useCabinetRole'

describe('useCabinetRole', () => {
  beforeEach(() => {
    resetAuthClientState()
  })

  it('maps admin role from valid access token claims', () => {
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({
        role_id: 2,
        role: 'Руководитель брокеров',
        full_name: 'Анна Админ',
      }),
      remember: false,
    })

    const { role, isAdmin, roleLabel, fullName } = useCabinetRole()

    expect(role.value).toBe('admin')
    expect(isAdmin.value).toBe(true)
    expect(roleLabel.value).toBe('Руководитель брокеров')
    expect(fullName.value).toBe('Анна Админ')
  })

  it('maps ordinary broker to user', () => {
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({ role_id: 1, role: 'Брокер' }),
      remember: false,
    })

    const { role, isAdmin } = useCabinetRole()

    expect(role.value).toBe('user')
    expect(isAdmin.value).toBe(false)
  })

  it('resets identity when tokens are cleared', async () => {
    const { persistTokens, clearTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({
        role_id: 2,
        role: 'Руководитель брокеров',
        full_name: 'Анна Админ',
      }),
      remember: true,
    })

    const { role, roleLabel, fullName } = useCabinetRole()
    expect(role.value).toBe('admin')

    clearTokens()
    await nextTick()

    expect(role.value).toBe('user')
    expect(roleLabel.value).toBeNull()
    expect(fullName.value).toBeNull()
  })

  it('recomputes role when access token changes', async () => {
    const { persistTokens } = useAuthToken()
    persistTokens({
      accessToken: makeAccessToken({
        role_id: 2,
        role: 'Руководитель брокеров',
        full_name: 'Анна Админ',
      }),
      remember: false,
    })

    const { role, isAdmin } = useCabinetRole()
    expect(role.value).toBe('admin')

    persistTokens({
      accessToken: makeAccessToken({ role_id: 1, role: 'Брокер', full_name: 'Иван Брокер' }),
      remember: false,
    })
    await nextTick()

    expect(role.value).toBe('user')
    expect(isAdmin.value).toBe(false)
  })
})
