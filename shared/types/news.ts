/** Карточка новости (список на главной; позже — ответ API). */
export interface NewsCardItem {
  id: string
  title: string
  excerpt: string
  imageSrc: string
  imageAlt: string
  tags: string[]
  /** Маршрут детальной страницы — подключим после API. */
  to?: string
}
