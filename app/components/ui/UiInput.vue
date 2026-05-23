<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    placeholder?: string
    readonly?: boolean
    disabled?: boolean
    inputmode?: 'text' | 'numeric' | 'decimal'
  }>(),
  {
    modelValue: '',
    id: '',
    placeholder: '',
    readonly: false,
    disabled: false,
    inputmode: 'text',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const inputId = computed(() => props.id || undefined)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div :class="[$style.shell, (disabled || readonly) && $style.isStatic]">
    <input
      :id="inputId"
      :class="$style.input"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :inputmode="inputmode"
      @input="onInput"
      @blur="emit('blur')"
    />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/form-field' as field;

.shell {
  @include field.ui-control-shell;
}

.isStatic {
  background-color: var(--fs-figma-achromatic-light-gray);
}

.input {
  @include field.ui-control-text;
}
</style>
