<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
}>()
</script>

<template>
  <div :class="$style.row">
    <div :class="$style.label">
      {{ label }}<span v-if="required" :class="$style.required" aria-hidden="true"> *</span>
    </div>
    <div :class="$style.value">
      <slot />
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

/* Как строки в CaseRoomTab: белый фон, две колонки, 14px. */
.row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  padding: rem(8) rem(16);
  border-radius: var(--fs-space-1);
  background-color: var(--fs-figma-achromatic-white);
}

.label {
  font-size: rem(14);
  line-height: 1.4;
  color: var(--fs-figma-achromatic-middle-gray);
}

.required {
  color: var(--fs-color-error);
}

.value {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  min-width: 0;
}
</style>
