import { describe, expect, it } from 'vitest'
import { mapCabinetRoleFromJwtClaims } from '#shared/utils/cabinetRoleFromJwt'

describe('mapCabinetRoleFromJwtClaims', () => {
  it('fail-closes to user when claims are null', () => {
    expect(mapCabinetRoleFromJwtClaims(null)).toEqual({
      role: 'user',
      roleId: null,
      roleLabel: null,
      fullName: null,
      sub: null,
    })
  })

  it('maps role_id=2 to admin', () => {
    const identity = mapCabinetRoleFromJwtClaims({
      role_id: 2,
      role: 'Руководитель брокеров',
      full_name: 'Анна Админ',
      sub: 7,
    })
    expect(identity).toEqual({
      role: 'admin',
      roleId: 2,
      roleLabel: 'Руководитель брокеров',
      fullName: 'Анна Админ',
      sub: '7',
    })
  })

  it('maps admin by role name markers when role_id is not admin', () => {
    expect(mapCabinetRoleFromJwtClaims({ role_id: 9, role: 'Администратор системы' }).role).toBe(
      'admin',
    )
    expect(mapCabinetRoleFromJwtClaims({ role: 'Admin panel' }).role).toBe('admin')
    expect(mapCabinetRoleFromJwtClaims({ role: 'руководитель отдела' }).role).toBe('admin')
  })

  it('maps ordinary broker to user', () => {
    const identity = mapCabinetRoleFromJwtClaims({
      role_id: 1,
      role: 'Брокер',
      full_name: 'Иван',
      sub: '10',
    })
    expect(identity.role).toBe('user')
    expect(identity.roleId).toBe(1)
    expect(identity.roleLabel).toBe('Брокер')
  })

  it('ignores non-number role_id and non-string labels', () => {
    const identity = mapCabinetRoleFromJwtClaims({
      role_id: '2',
      role: 123,
      full_name: null,
    })
    expect(identity.role).toBe('user')
    expect(identity.roleId).toBeNull()
    expect(identity.roleLabel).toBeNull()
    expect(identity.fullName).toBeNull()
  })
})
