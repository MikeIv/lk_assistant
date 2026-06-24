/**
 * Геометрия стыка триггера и flyout-подменю (Figma Menu point + junction fillets).
 * Все пункты с `children` в useCabinetNav используют эти токены через CSS-переменные.
 */
export const CABINET_NAV_SUBMENU_LAYOUT = {
  cornerRadiusPx: 16,
  bridgeHeightPx: 11,
  /** Вертикальное перекрытие bridge в триггер (компенсация border-bottom: 0 у UiNavButton.submenuOpen). */
  bridgeLiftPx: 1,
  /** Горизонтальное расширение bridge (по bleed с каждой стороны). */
  bridgeBleedPx: 1,
  /**
   * Смещение fillet со стороны inline-start (LTR: вправо).
   * Закрывает зазор у соседней неактивной вкладки.
   */
  junctionInsetInlineStartPx: 1,
  /**
   * Смещение fillet со стороны inline-end (LTR: 0).
   * Положительное значение сдвигает кривую внутрь — ломает правый стык триггера.
   */
  junctionInsetInlineEndPx: 0,
  /** Толщина «выреза» в radial-gradient: inner stop = radius - inset. */
  filletInnerInsetPx: 1,
  /** Фон кармана fillet — подложка навбара, не shell (иначе белая полоса на тёмном акценте). */
  bridgeBgVar: '--fs-figma-achromatic-light-gray',
} as const

export interface CabinetNavSubmenuStyleInput {
  accent: string
  triggerWidthPx: number
  flyoutLeftPx: number
  flyoutTopPx: number
}

/** CSS-переменные flyout-подменю для любого пункта с children. */
export function buildCabinetNavSubmenuStyleVars(
  input: CabinetNavSubmenuStyleInput,
): Record<string, string> {
  const layout = CABINET_NAV_SUBMENU_LAYOUT

  return {
    '--nav-submenu-accent': input.accent,
    '--nav-submenu-bridge-bg': `var(${layout.bridgeBgVar})`,
    '--nav-submenu-corner-radius': `${layout.cornerRadiusPx}px`,
    '--nav-bridge-height': `${layout.bridgeHeightPx}px`,
    '--nav-bridge-lift': `${layout.bridgeLiftPx}px`,
    '--nav-bridge-bleed': `${layout.bridgeBleedPx}px`,
    '--nav-junction-inset-inline-start': `${layout.junctionInsetInlineStartPx}px`,
    '--nav-junction-inset-inline-end': `${layout.junctionInsetInlineEndPx}px`,
    '--nav-fillet-inner-inset': `${layout.filletInnerInsetPx}px`,
    '--nav-trigger-width': `${input.triggerWidthPx}px`,
    '--nav-flyout-left': `${input.flyoutLeftPx}px`,
    '--nav-flyout-top': `${input.flyoutTopPx}px`,
  }
}
