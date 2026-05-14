import type { CabinetRole } from '#shared/types/cabinet'

/**
 * Текущая роль в ЛК. Заглушка: позже подставить данные авторизации / API.
 * Для проверки UI не-админа временно смените значение на `'user'`.
 */
export function useCabinetRole() {
  const role = useState<CabinetRole>('cabinet-role', () => 'admin')

  const isAdmin = computed(() => role.value === 'admin')

  return { role, isAdmin }
}
