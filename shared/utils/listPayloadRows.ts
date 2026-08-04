/** Строки списка из paginated payload (`data`) или legacy (`items`). */
export function listPayloadRows<T>(payload: { data?: T[]; items?: T[] } | null | undefined): T[] {
  return payload?.data ?? payload?.items ?? []
}
