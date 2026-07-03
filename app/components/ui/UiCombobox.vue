<script setup lang="ts">
import type { UiSelectOption } from '#shared/types/tenantData'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    isCustom?: boolean
    options: UiSelectOption[]
    placeholder?: string
    customPlaceholder?: string
  }>(),
  {
    modelValue: null,
    isCustom: false,
    placeholder: 'Выберите значение',
    customPlaceholder: 'Введите значение',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'update:isCustom': [value: boolean]
}>()

const { wrapperRef, isOpen, toggle, closeAfterSelection } = useUiDropdown()
const inputRef = ref<HTMLInputElement | null>(null)

const isCustomMode = computed({
  get: () => props.isCustom,
  set: (value: boolean) => emit('update:isCustom', value),
})

const textValue = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => emit('update:modelValue', value.trim() === '' ? null : value),
})

function isOptionSelected(option: UiSelectOption): boolean {
  if (option.isCustom) {
    return isCustomMode.value
  }

  return textValue.value === option.label
}

async function selectOption(option: UiSelectOption) {
  isCustomMode.value = Boolean(option.isCustom)

  if (option.isCustom) {
    textValue.value = ''
    closeAfterSelection()
    await nextTick()
    inputRef.value?.focus()
    return
  }

  textValue.value = option.label
  closeAfterSelection()
}

function onInputClick() {
  if (isCustomMode.value) {
    return
  }
  toggle()
}
</script>

<template>
  <div ref="wrapperRef" :class="$style.root">
    <div :class="[$style.shell, isOpen && $style.shellOpen]">
      <input
        ref="inputRef"
        :class="[$style.input, isCustomMode && $style.inputEditable, textValue && $style.inputFilled]"
        :value="textValue"
        :readonly="!isCustomMode"
        :placeholder="isCustomMode ? customPlaceholder : placeholder"
        @input="textValue = ($event.target as HTMLInputElement).value"
        @click.stop="onInputClick"
      />
      <button type="button" :class="$style.toggle" aria-label="Открыть список" @click.stop="toggle">
        <UIcon
          :name="isOpen ? 'i-arrow-chevron-dropdown-open' : 'i-arrow-chevron-dropdown'"
          :class="[$style.icon, isOpen && $style.iconOpen]"
          aria-hidden="true"
        />
      </button>
    </div>

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
  gap: rem(8);
}

.shellOpen {
  @include field.ui-control-shell-open;
}

.input {
  @include field.ui-dropdown-control-text;
  flex: 1;
  cursor: pointer;
}

.inputEditable,
.inputFilled {
  color: var(--fs-figma-achromatic-black);
  cursor: text;
}

.toggle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(20);
  height: rem(20);
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
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
