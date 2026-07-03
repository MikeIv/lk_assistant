import type { Applicant } from '#shared/types/applicants'
import { CATEGORIES_MOCK_ITEMS } from '#shared/constants/categoriesMock'
import { LEGAL_ENTITIES_MOCK_ITEMS } from '#shared/constants/legalEntitiesMock'

const BRAND_NAMES = [
  'Coffee House',
  'Sport Line',
  'Beauty Lab',
  'Tech Store',
  'Kids World',
  'Food Court',
  'Book Corner',
  'Shoe Gallery',
  'Optic Plus',
  'Flower Studio',
] as const

const COMPANY_GROUPS = [
  'Группа Альфа',
  'Холдинг Бета',
  'Сеть Гамма',
  null,
  'Ритейл Партнёр',
  null,
  'Олимп Групп',
] as const

function pickCategory(index: number) {
  const category = CATEGORIES_MOCK_ITEMS[index % CATEGORIES_MOCK_ITEMS.length]

  return {
    id: category?.id ?? 1,
    name: category?.name ?? 'Розничная торговля',
  }
}

function pickLegalEntities(index: number) {
  const count = (index % 3) + 1
  const entities = []

  for (let offset = 0; offset < count; offset += 1) {
    const entity = LEGAL_ENTITIES_MOCK_ITEMS[(index + offset) % LEGAL_ENTITIES_MOCK_ITEMS.length]

    if (entity) {
      entities.push({
        id: entity.id,
        legal_entity: entity.legal_entity,
        inn: entity.inn,
        kpp: entity.kpp,
      })
    }
  }

  return entities
}

/** 48 записей — для проверки пагинации и поиска в mock-режиме. */
export const APPLICANTS_MOCK_ITEMS: Applicant[] = Array.from({ length: 48 }, (_, index) => {
  const id = index + 1
  const category = pickCategory(index)
  const brand = BRAND_NAMES[index % BRAND_NAMES.length] ?? 'Brand'
  const companyGroup = COMPANY_GROUPS[index % COMPANY_GROUPS.length] ?? null

  return {
    id,
    title: `${brand} ${id}`,
    company_group: companyGroup,
    category_id: category.id,
    category_name: category.name,
    legal_entities: pickLegalEntities(index),
    contacts:
      index % 4 === 0
        ? [
            {
              name: 'Иванова Анна',
              position: 'Директор',
              phone_number: '+7 (495) 123-45-67',
              email: `contact${id}@example.com`,
            },
          ]
        : [],
  }
})
