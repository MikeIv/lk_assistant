import type { Premise } from '#shared/types/premises'
import { ROOM_TYPES_MOCK_ITEMS } from './roomTypesMock'

const PREMISES_ROOM_TYPES = ROOM_TYPES_MOCK_ITEMS.slice(0, 5)

const FLOORS = ['-1', '0', '1', '2', '3', '4', '5'] as const

function formatArea(seed: number): number {
  return Math.round((12 + (seed % 180) + (seed % 7) * 0.35) * 100) / 100
}

/** 196 записей — для проверки пагинации и поиска в mock-режиме. */
export const PREMISES_MOCK_ITEMS: Premise[] = Array.from({ length: 196 }, (_, index) => {
  const id = index + 1
  const roomType = PREMISES_ROOM_TYPES[index % PREMISES_ROOM_TYPES.length]!
  const floor = FLOORS[index % FLOORS.length] ?? '1'
  const area = formatArea(id)

  return {
    id,
    name: `${100 + (id % 900)}-${String((id % 20) + 1).padStart(2, '0')}`,
    floor,
    area,
    name_bti: id % 11 === 0 ? null : `${200 + (id % 800)}/${id % 50}`,
    floor_bti: id % 13 === 0 ? null : floor,
    area_bti: id % 17 === 0 ? null : area + (id % 3) * 0.12,
    room_type_id: roomType.id,
    room_type: roomType.name,
  }
})
