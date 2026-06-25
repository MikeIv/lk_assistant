import type { LegalEntity } from '#shared/types/legalEntities'

const COMPANY_PREFIXES = ['ООО', 'АО', 'ПАО', 'ИП'] as const

const COMPANY_NAMES = [
  'Альфа Трейд',
  'Бета Сервис',
  'Гамма Маркет',
  'Дельта Плюс',
  'Олимп Ритейл',
  'Северная Линия',
  'Южный Ветер',
  'Восток Групп',
  'Запад Инвест',
  'Меркурий',
  'Вега',
  'Сириус',
  'Полярная звезда',
  'Континент',
  'Премьер',
] as const

function padInn(seed: number): string {
  return String(7700000000 + seed).slice(0, 10)
}

function padKpp(seed: number): string | null {
  if (seed % 7 === 0) {
    return null
  }

  return String(770100000 + (seed % 900)).padStart(9, '0')
}

/** 196 записей — для проверки пагинации и поиска в mock-режиме. */
export const LEGAL_ENTITIES_MOCK_ITEMS: LegalEntity[] = Array.from({ length: 196 }, (_, index) => {
  const id = index + 1
  const prefix = COMPANY_PREFIXES[index % COMPANY_PREFIXES.length] ?? 'ООО'
  const name = COMPANY_NAMES[index % COMPANY_NAMES.length] ?? 'Компания'

  return {
    id,
    legal_entity: `${prefix} «${name} ${id}»`,
    inn: padInn(id),
    kpp: padKpp(id),
  }
})
