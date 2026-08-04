/** Форма paginated/list payload: массив, `data` или legacy `items`. */
export type ListPayloadShape<T> = T[] | { data?: T[]; items?: T[] } | null | undefined

/** Строки списка из `ListPayloadShape`. */
export function listPayloadRows<T>(payload: ListPayloadShape<T>): T[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  if (Array.isArray(payload.items)) {
    return payload.items
  }

  return []
}
