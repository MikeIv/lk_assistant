import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Component, ComponentPublicInstance } from 'vue'
import type { ComponentMountingOptions, VueWrapper } from '@vue/test-utils'

/** Stub `UIcon` — в unit-окружении коллекция иконок не нужна. */
export const uIconStub = {
  name: 'UIcon',
  props: {
    name: { type: String, default: '' },
  },
  template: '<span data-testid="u-icon" :data-name="name" />',
}

/**
 * Рендерит слот на месте — избегает багов Teleport + happy-dom
 * при закрытии dropdown (`insertBefore` на null).
 */
export const teleportStub = {
  name: 'Teleport',
  template: '<div data-testid="teleport-stub"><slot /></div>',
}

type MountUiOptions<C> = ComponentMountingOptions<C>

/** `mountSuspended` с общим stub `UIcon` / `Teleport` для UI Kit. */
export async function mountUi<C>(
  component: C,
  options: MountUiOptions<C> = {},
): Promise<VueWrapper<ComponentPublicInstance>> {
  const { global: globalOptions, ...rest } = options

  return mountSuspended(component as Component, {
    ...rest,
    global: {
      ...globalOptions,
      stubs: {
        teleport: teleportStub,
        Teleport: teleportStub,
        UIcon: uIconStub,
        ...(globalOptions?.stubs as Record<string, unknown> | undefined),
      },
    },
  })
}

/** Опции listbox (с учётом stub Teleport — ищем от wrapper или document). */
export function findListboxOptions(
  root: ParentNode | VueWrapper<ComponentPublicInstance> = document.body,
): HTMLElement[] {
  const el = 'element' in root ? (root.element as ParentNode) : root
  return Array.from(el.querySelectorAll('[role="option"]')) as HTMLElement[]
}
