/** Подпункт flyout-подменю верхней навигации ЛК. */
export interface CabinetSubNavItem {
  to: string
  label: string
  accent: string
  bannerGradientTo: string
  /** true — на странице свой контент, баннер «раздел в разработке» не показываем */
  hasContent?: boolean
}
