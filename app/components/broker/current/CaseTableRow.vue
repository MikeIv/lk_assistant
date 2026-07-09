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
@use '~/assets/styles/tools/typography' as typo;

.row {
  display: grid;
  grid-template-columns: minmax(rem(140), rem(220)) minmax(0, 1fr);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-bottom: 0;
  background: var(--fs-figma-achromatic-white);

  &:last-child {
    border-bottom: 1px solid var(--fs-figma-stroke-light-gray);
  }
}

.label {
  display: flex;
  align-items: center;
  padding: rem(12) rem(14);
  border-right: 1px solid var(--fs-figma-stroke-light-gray);
  background: var(--fs-figma-achromatic-light-gray);
  font-weight: 600;
  color: var(--fs-color-text);

  @include typo.fs-text-body;
}

.value {
  min-width: 0;
  padding: rem(8) rem(10);
}
</style>
