import type { Category } from '#shared/types/categories'

const BASE_NAMES = [
  'Розничная торговля',
  'Общепит',
  'Услуги',
  'Развлечения',
  'Спорт и фитнес',
  'Красота и здоровье',
  'Образование',
  'Банки и финансы',
  'Аптека',
  'Аренда',
] as const

/** 96 записей — для проверки пагинации и поиска в mock-режиме. */
export const CATEGORIES_MOCK_ITEMS: Category[] = Array.from({ length: 96 }, (_, index) => {
  const id = index + 1
  const baseName = BASE_NAMES[index % BASE_NAMES.length] ?? 'Розничная торговля'

  return {
    id,
    name: id <= BASE_NAMES.length ? baseName : `${baseName} ${id}`,
  }
})
