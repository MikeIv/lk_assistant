import type { Premise, PremiseApiResource } from '#shared/types/premises'

export function normalizePremise(item: PremiseApiResource): Premise {
  return {
    id: item.id,
    name: item.name,
    floor: item.floor ?? null,
    area: item.area ?? null,
    name_bti: item.name_bti ?? null,
    floor_bti: item.floor_bti ?? null,
    area_bti: item.area_bti ?? null,
    room_type_id: item.room_type_id,
    room_type: item.room_type ?? null,
  }
}
