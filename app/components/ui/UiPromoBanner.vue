<script setup lang="ts">
/**
 * Узкий промо-баннер UI Kit «Олимпийский» (Figma: NarrowBannerBrand, type=event).
 * node-id=3882-3441 — без фоновых изображений, градиент и декоративные блики CSS.
 */
export type UiPromoBannerPreset = 'events' | 'fitness' | 'entertainment' | 'aqua' | 'custom'

const props = withDefaults(
  defineProps<{
    /** Основной заголовок (опционально) */
    title?: string
    /** Текст сообщения */
    text: string
    /** Готовая палитра из токенов UI Kit */
    preset?: UiPromoBannerPreset
    /** Начальный цвет градиента (при preset=custom или переопределении) */
    gradientFrom?: string
    /** Конечный цвет градиента */
    gradientTo?: string
    /** Цвет текста на баннере */
    textColor?: string
  }>(),
  {
    title: '',
    preset: 'events',
    gradientFrom: '',
    gradientTo: '',
    textColor: 'var(--fs-figma-achromatic-white)',
  },
)

const presetGradients: Record<Exclude<UiPromoBannerPreset, 'custom'>, { from: string; to: string }> =
  {
    events: {
      from: 'var(--fs-figma-vertical-entertainments)',
      to: 'var(--fs-figma-main-building-main)',
    },
    fitness: {
      from: 'var(--fs-figma-vertical-fitness)',
      to: 'var(--fs-figma-main-building-concert-hall)',
    },
    entertainment: {
      from: 'var(--fs-figma-vertical-children)',
      to: 'var(--fs-figma-vertical-entertainments)',
    },
    aqua: {
      from: 'var(--fs-figma-vertical-aqua-park)',
      to: 'var(--fs-figma-vertical-surfing)',
    },
  }

const bannerStyle = computed(() => {
  const presetPair =
    props.preset === 'custom' ? presetGradients.events : presetGradients[props.preset]
  const from = props.gradientFrom || presetPair.from
  const to = props.gradientTo || presetPair.to

  return {
    '--ui-promo-banner-gradient-from': from,
    '--ui-promo-banner-gradient-to': to,
    '--ui-promo-banner-text': props.textColor,
  }
})
</script>

<template>
  <article :class="$style.root" :style="bannerStyle" role="status">
    <div :class="$style.decor" aria-hidden="true" />
    <div :class="$style.content">
      <h3 v-if="props.title !== ''" :class="$style.title">
        {{ props.title }}
      </h3>
      <p :class="$style.text">
        <slot>{{ props.text }}</slot>
      </p>
    </div>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  position: relative;
  overflow: hidden;
  min-height: rem(200);
  border-radius: rem(25);
  color: var(--ui-promo-banner-text);
  background: linear-gradient(
    95deg,
    var(--ui-promo-banner-gradient-from) 0%,
    var(--ui-promo-banner-gradient-to) 100%
  );
}

.decor {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &::before,
  &::after {
    position: absolute;
    content: '';
    border-radius: 50%;
  }

  /* Декоративный «Y»-блик из макета — без растровых ассетов */
  &::before {
    top: -45%;
    right: -8%;
    width: 58%;
    height: 190%;
    background: linear-gradient(
      168deg,
      rgb(255 255 255 / 0.34) 0%,
      rgb(255 255 255 / 0.12) 42%,
      transparent 72%
    );
    transform: rotate(-92deg);
  }

  &::after {
    right: 12%;
    bottom: -55%;
    width: 42%;
    height: 130%;
    background: radial-gradient(
      ellipse 70% 55% at 50% 50%,
      rgb(255 255 255 / 0.2) 0%,
      transparent 70%
    );
    transform: rotate(-18deg);
  }
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--fs-space-2);
  max-width: rem(728);
  min-height: inherit;
  padding: var(--fs-space-3);
}

.title {
  margin: 0;

  @include typo.fs-text-card-promo-title;
}

.text {
  margin: 0;
  max-width: rem(42rem);

  @include typo.fs-text-h4;
}

@media (min-width: bp.$tablet) {
  .content {
    padding: var(--fs-space-4);
  }
}

@media (min-width: bp.$desktopMin) {
  .root {
    min-height: rem(300);
  }

  .content {
    padding: var(--fs-space-5) var(--fs-space-6);
  }
}
</style>
