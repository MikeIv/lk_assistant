import type { NewsCardItem } from '#shared/types/news'

/** Статичные данные раздела «Новости» до подключения API. */
export const NEWS_MOCK_ITEMS: NewsCardItem[] = [
  {
    id: 'holiday-schedule',
    title: 'Режим работы ТРЦ в праздничные дни',
    excerpt: 'График работы торгового центра и сервисов арендаторов на майские праздники.',
    imageSrc: '/images/news/news-1.jpg',
    imageAlt: 'Интерьер торгового центра',
    tags: ['Аренда', '12 мая'],
  },
  {
    id: 'pass-rules',
    title: 'Обновлены правила оформления пропусков',
    excerpt: 'Кратко о новых требованиях к заявкам на пропуска для сотрудников и подрядчиков.',
    imageSrc: '/images/news/news-2.jpg',
    imageAlt: 'Сотрудники у входа в торговый центр',
    tags: ['Пропуска', '8 мая'],
  },
  {
    id: 'cabinet-launch',
    title: 'Запущен обновлённый личный кабинет',
    excerpt: 'Новый интерфейс для отчётов, заявок и управления пользователями арендатора.',
    imageSrc: '/images/news/news-3.jpg',
    imageAlt: 'Рабочее место с ноутбуком',
    tags: ['Личный кабинет', '2 мая'],
  },
  {
    id: 'march-meeting',
    title: 'Итоги совещания с управляющей компанией',
    excerpt: 'Основные договорённости по эксплуатации и взаимодействию с арендаторами за март.',
    imageSrc: '/images/news/news-4.jpg',
    imageAlt: 'Зал для деловых встреч',
    tags: ['События', '28 апр'],
  },
]
