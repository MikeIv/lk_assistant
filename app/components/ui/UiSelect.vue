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

const { wrapperRef, isOpen, toggle, closeAfterSelection } = useUiDropdown()

const displayValue = computed(() => {
  if (!props.modelValue) {
    return ''
  }

  const matched = props.options.find(
    (option) => option.outputValue === props.modelValue || option.label === props.modelValue,
  )

  return matched?.label ?? props.modelValue
})

function isOptionSelected(option: UiSelectOption): boolean {
  const value = option.outputValue ?? option.label
  return props.modelValue === value || props.modelValue === option.label
}

function selectOption(option: UiSelectOption) {
  emit('update:modelValue', option.outputValue ?? option.label)
  closeAfterSelection()
}
</script>

<template>
  <div ref="wrapperRef" :class="$style.root">
    <button
      type="button"
      :class="[$style.shell, isOpen && $style.shellOpen, disabled && $style.disabled]"
      :disabled="disabled"
      :aria-expanded="isOpen"
      @click.stop="toggle"
    >
      <span :class="[displayValue ? $style.value : $style.placeholder]">
        {{ displayValue || placeholder }}
      </span>
      <UIcon
        :name="isOpen ? 'i-arrow-chevron-dropdown-open' : 'i-arrow-chevron-dropdown'"
        :class="[$style.icon, isOpen && $style.iconOpen]"
        aria-hidden="true"
      />
    </button>

    <ul v-if="isOpen" :class="$style.dropdown" role="listbox" @mousedown.prevent>
      <li
        v-for="option in options"
        :key="option.value"
        :class="[$style.option, isOptionSelected(option) && $style.optionSelected]"
        role="option"
        :aria-selected="isOptionSelected(option)"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/form-field' as field;

.root {
  position: relative;
  width: 100%;
}

.shell {
  @include field.ui-dropdown-control-shell;
  justify-content: space-between;
  gap: rem(8);
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.shellOpen {
  @include field.ui-control-shell-open;
}

.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.value {
  @include field.ui-dropdown-control-text;
  flex: 1;
}

.placeholder {
  @include field.ui-dropdown-control-text;
  flex: 1;
  color: var(--fs-figma-achromatic-middle-gray);
}

.icon {
  @include field.ui-dropdown-chevron;
}

.iconOpen {
  @include field.ui-dropdown-chevron-open;
}

.dropdown {
  @include field.ui-dropdown-panel;
}

.option {
  @include field.ui-dropdown-option;
}

.optionSelected {
  @include field.ui-dropdown-option-selected;
}
</style>
