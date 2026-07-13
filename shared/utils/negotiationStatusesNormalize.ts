import type {
  NegotiationStatus,
  NegotiationStatusApiResource,
} from '#shared/types/negotiationStatuses'
import type { UiSelectOption } from '#shared/types/tenantData'

export function normalizeNegotiationStatus(item: NegotiationStatusApiResource): NegotiationStatus {
  return {
    id: item.id,
    status: item.status,
    name: item.name,
    created_by_id: item.created_by_id ?? null,
    responsible: item.responsible ?? null,
    created_at: item.created_at,
  }
}

export function mapNegotiationStatusesToSelectOptions(
  items: NegotiationStatus[],
): UiSelectOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name || item.status,
    outputValue: String(item.id),
  }))
}
