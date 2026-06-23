<script setup lang="ts">
/**
 * Сегмент нижней навигации UI Kit (Figma Menu point, node 13:164).
 * Не путать с UiButton — отдельные размеры, состояния и разметка.
 */
const props = withDefaults(
  defineProps<{
    /** Без `to` — кнопка-триггер подменю (клик, не навигация). */
    to?: string
    label: string
    active?: boolean
    /** Подменю открыто — нижние углы без скругления для стыка с плашкой. */
    submenuOpen?: boolean
    /** CSS-цвет акцента (полоска / заливка Active) */
    accent?: string
    /** Пункт «Главная» (без полоски, active — metallic border) */
    home?: boolean
  }>(),
  {
    active: false,
    submenuOpen: false,
    to: undefined,
    accent: 'var(--fs-figma-vertical-shop)',
    home: false,
  },
)

const emit = defineEmits<{
  click: []
}>()

const style = useCssModule()
const isLink = computed(() => Boolean(props.to))

const rootStyle = computed(() => ({
  '--ui-nav-accent': props.accent,
}))

const sharedClass = computed(() => ({
  [style.active]: props.active,
  [style.home]: props.home,
  [style.segment]: !props.home,
  [style.submenuOpen]: props.submenuOpen,
}))
</script>

<template>
  <NuxtLink
    v-if="isLink"
    :to="props.to!"
    :class="[style.root, sharedClass]"
    :style="rootStyle"
    :aria-current="props.active ? 'page' : undefined"
    @click="emit('click')"
  >
    <span :class="$style.label">{{ props.label }}</span>
    <span v-if="!props.home && !props.active" :class="$style.indicator" aria-hidden="true" />
  </NuxtLink>
  <button
    v-else
    type="button"
    :class="[style.root, sharedClass]"
    :style="rootStyle"
    v-bind="$attrs"
    @click="emit('click')"
  >
    <span :class="$style.label">{{ props.label }}</span>
    <span v-if="!props.home && !props.active" :class="$style.indicator" aria-hidden="true" />
  </button>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;

.root {
  box-sizing: border-box;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  font: inherit;
  text-decoration: none;
  color: var(--fs-figma-achromatic-black);
  background: var(--fs-color-cabinet-nav-segment-bg);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

/* Touch / tablet (Figma Touch/Navbar 478:934) */
.segment {
  flex-direction: column;
  justify-content: space-between;
  min-height: rem(45);
  padding: rem(10) rem(18) rem(11);
  border-radius: rem(12);
  gap: rem(4);
  color: var(--fs-figma-achromatic-black);
  background: var(--fs-color-cabinet-nav-segment-bg);
}

.home {
  min-height: rem(45);
  padding: rem(10) rem(18);
  border-radius: rem(12);
}

.label {
  font-family: var(--fs-font-sans);
  font-size: rem(11);
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.indicator {
  flex-shrink: 0;
  width: rem(22);
  height: rem(7);
  border-radius: rem(24);
  background: var(--ui-nav-accent);
}

.segment:hover:not(.active) {
  border-color: var(--fs-figma-achromatic-white);
  box-shadow: 0 0 0 1px var(--fs-figma-stroke-light-gray);
}

.segment.active {
  justify-content: center;
  gap: 0;
  min-height: rem(45);
  padding: rem(10) rem(18);
  color: var(--fs-figma-achromatic-white);
  background: var(--ui-nav-accent);
  border-color: var(--ui-nav-accent);
}

.segment.submenuOpen {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.segment.submenuOpen.active {
  border-top-left-radius: rem(12);
  border-top-right-radius: rem(12);
}

.home.active {
  border-width: rem(2);
  border-color: var(--fs-color-cabinet-nav-indicator-home);
}

@include mq.from-tablet {
  .segment {
    flex-direction: column;
    justify-content: flex-start;
    gap: rem(4);
    min-height: rem(50);
    padding: rem(11) rem(22) rem(10);
    border-radius: rem(15);
  }

  .home {
    min-height: rem(50);
    padding: rem(11) rem(22);
    border-radius: rem(15);
  }

  .label {
    font-size: rem(13);
    letter-spacing: 0;
  }

  .segment.active {
    justify-content: center;
    gap: 0;
    min-height: rem(50);
    padding: rem(11) rem(22);
  }

  .segment.submenuOpen.active {
    border-top-left-radius: rem(15);
    border-top-right-radius: rem(15);
  }
}

@media (prefers-reduced-motion: reduce) {
  .root {
    transition: none;
  }
}
</style>
