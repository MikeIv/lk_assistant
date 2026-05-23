<script setup lang="ts">
defineProps<{
  label: string
  forId?: string
}>()
</script>

<template>
  <div :class="$style.root">
    <label :class="$style.label" :for="forId || undefined">{{ label }}</label>
    <slot />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/form-field' as field;

.root {
  @include field.ui-field-stack;
}

.label {
  @include field.ui-field-label;
}
</style>
