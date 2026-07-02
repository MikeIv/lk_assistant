import type { RoomType, RoomTypeApiResource } from '#shared/types/roomTypes'

export function normalizeRoomType(item: RoomTypeApiResource): RoomType {
  return {
    id: item.id,
    name: item.name,
  }
}
