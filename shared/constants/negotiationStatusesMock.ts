import type { NegotiationStatus } from '#shared/types/negotiationStatuses'

/** Соответствует `GET /v1/broker/dict/negotiation-statuses` (id 1–3). */
export const NEGOTIATION_STATUSES_MOCK_ITEMS: NegotiationStatus[] = [
  {
    id: 1,
    status: 'переговоры',
    name: 'переговоры',
    created_by_id: null,
    responsible: null,
    created_at: '2026-07-13 02:04:47',
  },
  {
    id: 2,
    status: 'отказ',
    name: 'отказ',
    created_by_id: null,
    responsible: null,
    created_at: '2026-07-13 02:04:47',
  },
  {
    id: 3,
    status: 'отказ с нашей стороны',
    name: 'отказ с нашей стороны',
    created_by_id: null,
    responsible: null,
    created_at: '2026-07-13 02:04:47',
  },
]
