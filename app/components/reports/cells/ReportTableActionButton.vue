<script setup lang="ts">
defineProps<{
  label: string
  loading?: boolean
  disabled?: boolean
  variant?: 'outline' | 'soft'
  fixedWidth?: boolean
  title?: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    :class="[$style.root, variant === 'soft' ? $style.soft : $style.outline, { [$style.fixed]: fixedWidth }]"
    :disabled="disabled || loading"
    :title="title"
    @click="emit('click')"
  >
    <span v-if="loading" :class="$style.spinner" aria-hidden="true" />
    <span :class="$style.label">{{ loading ? 'Скачиваем' : label }}</span>
  </button>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: rem(4);
  min-height: rem(28);
  padding: rem(4) rem(8);
  border-radius: rem(6);
  font-size: rem(12);
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.16s ease;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.outline {
  border: 1px solid var(--fs-color-border);
  color: var(--fs-color-text);
  background: var(--fs-color-bg);

  &:hover:not(:disabled) {
    background: var(--fs-figma-achromatic-light-gray);
  }
}

.soft {
  border: 1px solid transparent;
  color: var(--fs-color-error);
  background: rgb(238 46 34 / 0.08);

  &:hover:not(:disabled) {
    background: rgb(238 46 34 / 0.14);
  }
}

.fixed {
  min-width: rem(95);
}

.label {
  white-space: nowrap;
}

.spinner {
  width: rem(12);
  height: rem(12);
  border: rem(2) solid var(--fs-figma-stroke-light-gray);
  border-top-color: var(--fs-color-primary);
  border-radius: 50%;
  animation: reports-action-spin 0.8s linear infinite;
}

@keyframes reports-action-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
