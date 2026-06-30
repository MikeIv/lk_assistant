export type PremiseSortKey =
  | 'id'
  | 'name'
  | 'floor'
  | 'area'
  | 'room_type'
  | 'name_bti'
  | 'floor_bti'
  | 'area_bti'

export type PremiseSortDirection = 'asc' | 'desc'

export interface Premise {
  id: number
  name: string
  floor: string | null
  area: number | null
  name_bti: string | null
  floor_bti: string | null
  area_bti: number | null
  room_type_id: number
  room_type: string | null
}

export interface RoomType {
  id: number
  name: string
}

export interface PremisesPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  /** Первая запись на текущей странице (1-based), 0 если пусто. */
  rangeFrom: number
  /** Последняя запись на текущей странице. */
  rangeTo: number
}

export interface PremiseApiResource {
  id: number
  name: string
  floor: string | null
  area: number | null
  name_bti: string | null
  floor_bti: string | null
  area_bti: number | null
  room_type_id: number
  room_type: string | null
}

export interface RoomTypeApiResource {
  id: number
  name: string
}

export interface PremisesListApiResponse {
  success: boolean
  message: string
  payload: {
    items: PremiseApiResource[]
  }
}

export interface RoomTypesListApiResponse {
  success: boolean
  message: string
  payload: {
    items: RoomTypeApiResource[]
  }
}

export interface PremiseCreatePayload {
  room_type_id: number
  name: string
  floor: string | null
  area: number | null
  name_bti: string | null
  floor_bti: string | null
  area_bti: number | null
}
