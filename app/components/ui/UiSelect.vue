<script setup lang="ts">
import type { UiSelectOption } from '#shared/types/tenantData'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    options: UiSelectOption[]
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'Не выбрано',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { wrapperRef, isOpen, toggle, close } = useUiDropdown()

const displayValue = computed(() => {
  if (!props.modelValue) {
    return ''
  }

  const matched = props.options.find(
    (option) => option.outputValue === props.modelValue || option.label === props.modelValue,
  )

  return matched?.label ?? props.modelValue
})

function selectOption(option: UiSelectOption) {
  emit('update:modelValue', option.outputValue ?? option.label)
  close()
}
</script>

<template>
  <div ref="wrapperRef" :class="$style.root">
    <button
      type="button"
      :class="[$style.shell, disabled && $style.disabled]"
      :disabled="disabled"
      :aria-expanded="isOpen"
      @click.stop="toggle"
    >
      <span :class="[displayValue ? $style.value : $style.placeholder]">
        {{ displayValue || placeholder }}
      </span>
      <UIcon name="i-arrow-chevron-dropdown" :class="$style.icon" aria-hidden="true" />
    </button>

    <ul v-if="isOpen" :class="$style.dropdown" role="listbox">
      <li
        v-for="option in options"
        :key="option.value"
        :class="$style.option"
        role="option"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/form-field' as field;
@use '~/assets/styles/tools/functions' as *;

.root {
  position: relative;
  width: 100%;
}

.shell {
  @include field.ui-control-shell;
  justify-content: space-between;
  gap: var(--fs-space-1);
  cursor: pointer;
  text-align: left;
}

.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.value {
  @include field.ui-control-text;
  flex: 1;
}

.placeholder {
  @include field.ui-control-text;
  flex: 1;
  color: var(--fs-figma-achromatic-middle-gray);
}

.icon {
  flex-shrink: 0;
  width: rem(24);
  height: rem(24);
  color: var(--fs-figma-achromatic-middle-gray);
}

.dropdown {
  @include field.ui-dropdown-panel;
}

.option {
  @include field.ui-dropdown-option;
}
</style>
