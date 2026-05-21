/** Карточка пропуска сотрудника (раздел «Мои пропуска»; позже — ответ API). */
export interface EmployeePassCardItem {
  id: string
  photoSrc: string
  photoAlt: string
  firstName: string
  patronymic: string
  lastName: string
  /** Дата окончания действия, отображаемая строка (например «31.07.2027»). */
  validUntil: string
  passNumber: string
}
