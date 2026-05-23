<script setup lang="ts">
const props = defineProps<{
  checked: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

function onChange() {
  if (!props.disabled) {
    emit('toggle')
  }
}
</script>

<template>
  <input
    type="checkbox"
    :class="$style.checkbox"
    :checked="checked"
    :disabled="disabled"
    title="Выбрать черновик"
    @change="onChange"
  />
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.checkbox {
  width: rem(16);
  height: rem(16);
  cursor: pointer;
  accent-color: var(--fs-color-button-on-light);
}
</style>
