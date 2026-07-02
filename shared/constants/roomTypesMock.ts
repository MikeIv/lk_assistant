import type { RoomType } from '#shared/types/roomTypes'

const BASE_NAMES = [
  'Торговое',
  'Офисное',
  'Складское',
  'Пищевое',
  'Сервисное',
  'Выставочное',
  'Производственное',
  'Спортивное',
  'Медицинское',
  'Общепит',
] as const

/** 96 записей — для проверки пагинации и поиска в mock-режиме. */
export const ROOM_TYPES_MOCK_ITEMS: RoomType[] = Array.from({ length: 96 }, (_, index) => {
  const id = index + 1
  const baseName = BASE_NAMES[index % BASE_NAMES.length] ?? 'Торговое'

  return {
    id,
    name: id <= BASE_NAMES.length ? baseName : `${baseName} ${id}`,
  }
})
