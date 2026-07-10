<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div :class="$style.row">
    <div :class="$style.label">{{ label }}</div>
    <div :class="$style.value">
      <slot />
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/ui-kit-card' as card;

.row {
  @include card.param-row;
}

.label {
  flex: 0 1 auto;
  min-width: rem(120);

  @include card.param-label;
}

.value {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  min-width: 0;
  max-width: min(100%, rem(420));
  margin-inline-start: auto;
}
</style>
