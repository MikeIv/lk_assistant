import type { EmployeePassCardItem } from '#shared/types/employeePass'

/** Статичные данные раздела «Мои пропуска» до подключения API. */
export const PASSES_MOCK_ITEMS: EmployeePassCardItem[] = [
  {
    id: 'pass-117324',
    photoSrc: '/images/passes/pass-1.jpg',
    photoAlt: 'Фото сотрудника Джейсон Стетхэм',
    firstName: 'Джейсон',
    patronymic: 'Владимирович',
    lastName: 'Стетхэм',
    validUntil: '31.07.2027',
    passNumber: '117324',
  },
  {
    id: 'pass-118901',
    photoSrc: '/images/passes/pass-2.jpg',
    photoAlt: 'Фото сотрудника Анастасия Иванова',
    firstName: 'Анастасия',
    patronymic: 'Сергеевна',
    lastName: 'Иванова',
    validUntil: '15.12.2026',
    passNumber: '118901',
  },
  {
    id: 'pass-119045',
    photoSrc: '/images/passes/pass-3.jpg',
    photoAlt: 'Фото сотрудника Максим Петров',
    firstName: 'Максим',
    patronymic: 'Андреевич',
    lastName: 'Петров',
    validUntil: '01.03.2028',
    passNumber: '119045',
  },
]
