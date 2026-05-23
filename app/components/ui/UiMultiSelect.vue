<script setup lang="ts">
import type { UiSelectOption } from '#shared/types/tenantData'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    options: UiSelectOption[]
    placeholder?: string
  }>(),
  {
    modelValue: null,
    placeholder: 'Не выбрано',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { wrapperRef, isOpen, toggle } = useUiDropdown()

const selectedValues = computed<string[]>(() => {
  if (!props.modelValue) {
    return []
  }

  return props.modelValue.split(',').map((part) => part.trim()).filter(Boolean)
})

const displayValue = computed(() => selectedValues.value.join(', '))

function isSelected(option: UiSelectOption): boolean {
  return selectedValues.value.includes(option.label)
}

function toggleOption(option: UiSelectOption) {
  const next = new Set(selectedValues.value)

  if (next.has(option.label)) {
    next.delete(option.label)
  } else {
    next.add(option.label)
  }

  const value = [...next].join(', ')
  emit('update:modelValue', value.trim() === '' ? null : value)
}
</script>

<template>
  <div ref="wrapperRef" :class="$style.root">
    <button
      type="button"
      :class="$style.shell"
      :aria-expanded="isOpen"
      @click.stop="toggle"
    >
      <span :class="[displayValue ? $style.value : $style.placeholder]">
        {{ displayValue || placeholder }}
      </span>
      <UIcon name="i-arrow-chevron-dropdown" :class="$style.icon" aria-hidden="true" />
    </button>

    <ul v-if="isOpen" :class="$style.dropdown" role="listbox" aria-multiselectable="true">
      <li
        v-for="option in options"
        :key="option.value"
        :class="$style.option"
        role="option"
        :aria-selected="isSelected(option)"
        @click="toggleOption(option)"
      >
        <span :class="[$style.checkbox, isSelected(option) && $style.checkboxChecked]" aria-hidden="true" />
        <span>{{ option.label }}</span>
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
  display: flex;
  align-items: center;
  gap: var(--fs-space-1);
}

.checkbox {
  box-sizing: border-box;
  flex-shrink: 0;
  width: rem(16);
  height: rem(16);
  border: 1px solid var(--fs-figma-stroke-gray);
  border-radius: rem(4);
  background-color: var(--fs-figma-achromatic-white);
}

.checkboxChecked {
  position: relative;
  border-color: var(--fs-figma-system-button-gray);
  background-color: var(--fs-figma-system-button-gray);

  &::after {
    content: '';
    position: absolute;
    top: rem(2);
    left: rem(5);
    width: rem(4);
    height: rem(8);
    border: solid var(--fs-figma-achromatic-white);
    border-width: 0 rem(2) rem(2) 0;
    transform: rotate(45deg);
  }
}
</style>
