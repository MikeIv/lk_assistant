import type { Category, CategoryApiResource } from '#shared/types/categories'

export function normalizeCategory(item: CategoryApiResource): Category {
  return {
    id: item.id,
    name: item.name,
  }
}
