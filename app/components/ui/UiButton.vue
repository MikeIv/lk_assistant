<script setup lang="ts">
export type UiButtonVariant = 'primary' | 'inverse' | 'outline' | 'soft' | 'accent'
export type UiButtonSize = 'md' | 'sm' | 'arrow'
export type UiButtonIconPosition = 'left' | 'right'

const props = withDefaults(
  defineProps<{
    variant?: UiButtonVariant
    size?: UiButtonSize
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
    label?: string
    /** Имя иконки Nuxt Icon, например i-local-logo */
    icon?: string
    iconPosition?: UiButtonIconPosition
    /** Размер иконки: число (px) или CSS-строка */
    iconSize?: number | string
    /** Без стилей UI Kit — только семантика кнопки */
    unstyled?: boolean
    /**
     * Узкие контейнеры (напр. свёрнутый сайдбар): без min-width 92px у `md`,
     * иначе кнопка шире колонки.
     */
    fit?: boolean
    /** Многострочная подпись (узкая ширина) */
    wrap?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
    label: '',
    icon: '',
    iconPosition: 'left',
    iconSize: '',
    unstyled: false,
    fit: false,
    wrap: false,
  },
)

const slots = useSlots()
const attrs = useAttrs()

const isDisabled = computed(() => props.disabled || props.loading)
const hasIcon = computed(() => Boolean(props.icon))
const hasText = computed(() => {
  if (props.label !== '') {
    return true
  }
  const nodes = slots.default?.()
  return Array.isArray(nodes) && nodes.length > 0
})

const iconStyle = computed<Record<string, string> | undefined>(() => {
  if (!hasIcon.value || props.iconSize === '') {
    return undefined
  }
  const v = typeof props.iconSize === 'number' ? `${props.iconSize}px` : props.iconSize
  return { '--ui-btn-icon-size': v }
})

const cssm = useCssModule()

const spinnerWrapClass = computed(() => {
  if (props.size === 'sm') {
    return cssm.spinnerWrapSm
  }
  if (props.size === 'arrow') {
    return cssm.spinnerWrapArrow
  }
  return undefined
})
</script>

<template>
  <button
    v-bind="attrs"
    :type="props.type"
    :disabled="isDisabled"
    :aria-busy="props.loading || undefined"
    :class="
      props.unstyled
        ? undefined
        : [
            $style.btn,
            $style[props.size],
            $style[props.variant],
            {
              [$style.withIcon]: hasIcon && hasText,
              [$style.iconRight]: hasIcon && props.iconPosition === 'right',
              [$style.loading]: props.loading,
              [$style.fit]: props.fit,
              [$style.wrap]: props.wrap,
              [$style.iconOnly]: hasIcon && !hasText,
            },
          ]
    "
  >
    <span v-if="props.loading" :class="[$style.spinnerWrap, spinnerWrapClass]" aria-hidden="true">
      <span :class="$style.spinner" />
    </span>
    <template v-else>
      <UIcon
        v-if="hasIcon"
        :name="props.icon"
        :class="$style.iconGlyph"
        :style="iconStyle"
        aria-hidden="true"
      />
      <span v-if="hasText" :class="$style.label">
        <slot>{{ props.label }}</slot>
      </span>
    </template>
  </button>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

/* Общий disabled (primary / inverse / accent / soft) */
@mixin disabled-neutral {
  color: var(--fs-figma-achromatic-middle-gray);
  background-color: var(--fs-figma-system-gray);
  border-color: var(--fs-color-ui-button-border);
}

.btn {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-family: var(--fs-font-sans);
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  border-style: solid;
  border-width: rem(2);
  contain: layout;
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    filter 0.16s ease;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

/* Высота md = arrow (44px), чтобы не было скачка при смене размера в сайдбаре */
.md {
  min-width: rem(92);
  min-height: rem(44);
  height: rem(44);
  padding: 0 rem(24);
  font-size: rem(16);
  border-radius: rem(25);
}

.fit {
  min-width: 0;
}

.wrap {
  height: auto;
  white-space: normal;
  line-height: 1.25;
}

.wrap.md {
  min-height: rem(44);
  padding: rem(8) rem(10);
}

.wrap.sm {
  min-height: rem(32);
  padding: rem(6) rem(8);
}

.sm {
  min-width: 0;
  min-height: rem(32);
  height: rem(32);
  padding: 0 rem(14);
  font-size: rem(13);
  border-radius: rem(8);
}

/* Figma «Arrow button» (4587:3511): 64×44, pill — та же высота, что у md */
.arrow {
  min-width: rem(64);
  width: rem(64);
  max-width: rem(64);
  min-height: rem(44);
  height: rem(44);
  padding: 0;
  font-size: rem(16);
  border-radius: rem(999);
}

.iconOnly {
  line-height: 0;
}

.label {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.withIcon {
  gap: rem(4);
}

.iconRight {
  flex-direction: row-reverse;
}

.iconGlyph {
  flex-shrink: 0;
  width: var(--ui-btn-icon-size, #{rem(24)});
  height: var(--ui-btn-icon-size, #{rem(24)});
  line-height: 0;
}

.loading {
  pointer-events: none;
}

.spinnerWrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: rem(44);
  line-height: 0;
}

.spinnerWrapSm {
  min-width: rem(28);

  .spinner {
    width: rem(16);
    height: rem(16);
  }
}

.spinnerWrapArrow {
  min-width: rem(44);

  .spinner {
    width: rem(20);
    height: rem(20);
  }
}

.spinner {
  box-sizing: border-box;
  width: rem(20);
  height: rem(20);
  border: rem(2) solid rgb(23 23 32 / 0.12);
  border-top-color: var(--fs-figma-achromatic-black);
  border-radius: 50%;
  animation: ui-btn-spin 0.65s linear infinite;
}

.inverse .spinner,
.accent .spinner {
  border-color: rgb(255 255 255 / 0.25);
  border-top-color: var(--fs-figma-achromatic-white);
}

.outline .spinner,
.soft .spinner {
  border-color: rgb(23 23 32 / 0.12);
  border-top-color: var(--fs-figma-achromatic-black);
}

.primary {
  color: var(--fs-figma-achromatic-black);
  background-color: var(--fs-figma-achromatic-white);
  border-color: var(--fs-color-ui-button-border);

  &:hover:not(:disabled) {
    border-color: rgb(234 234 235 / 0.55);
    box-shadow: 0 0 0 1px rgb(234 234 235 / 0.35);
  }

  &:active:not(:disabled) {
    filter: brightness(0.98);
  }

  &:disabled {
    @include disabled-neutral;
  }
}

.primary.arrow:hover:not(:disabled),
.primary.arrow:active:not(:disabled) {
  background-color: var(--fs-figma-achromatic-light-gray);
  border-color: var(--fs-color-ui-button-border);
  filter: none;
  box-shadow: none;
}

.inverse {
  color: var(--fs-figma-achromatic-white);
  background-color: var(--fs-figma-achromatic-black);
  border-color: var(--fs-color-ui-button-border);

  &:hover:not(:disabled) {
    background-color: var(--fs-figma-system-button-gray);
    border-color: rgb(255 255 255 / 0.22);
  }

  &:active:not(:disabled) {
    color: var(--fs-color-ui-button-inverse-pressed-text);
  }

  &:disabled {
    @include disabled-neutral;
  }
}

.accent {
  color: var(--fs-figma-achromatic-white);
  background-color: var(--fs-color-primary);
  border-color: rgb(255 255 255 / 0.22);

  &:hover:not(:disabled) {
    filter: brightness(0.94);
    border-color: rgb(255 255 255 / 0.35);
  }

  &:active:not(:disabled) {
    filter: brightness(0.88);
  }

  &:disabled {
    @include disabled-neutral;
  }
}

.outline {
  color: var(--fs-figma-achromatic-black);
  background-color: var(--fs-figma-achromatic-white);
  border-color: var(--fs-figma-stroke-light-gray);

  &:hover:not(:disabled) {
    border-color: var(--fs-color-ui-button-outline-hover);
  }

  &:active:not(:disabled) {
    color: var(--fs-figma-achromatic-middle-gray);
    border-color: var(--fs-color-ui-button-outline-hover);
  }

  &:disabled {
    color: var(--fs-figma-achromatic-middle-gray);
    border-color: var(--fs-color-ui-button-outline-hover);
  }
}

.soft {
  color: var(--fs-figma-achromatic-black);
  background-color: var(--fs-figma-system-gray);
  border-color: var(--fs-color-ui-button-border);

  &:hover:not(:disabled) {
    color: var(--fs-figma-achromatic-dark-gray);
    border-color: rgb(234 234 235 / 0.45);
  }

  &:active:not(:disabled) {
    color: var(--fs-figma-achromatic-middle-gray);
  }

  &:disabled {
    @include disabled-neutral;
  }
}

@keyframes ui-btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
