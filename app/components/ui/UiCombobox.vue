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

const { wrapperRef, isOpen, toggle, close } = useUiDropdown()
const inputRef = ref<HTMLInputElement | null>(null)

const isCustomMode = computed({
  get: () => props.isCustom,
  set: (value: boolean) => emit('update:isCustom', value),
})

const textValue = computed({
  get: () => props.modelValue ?? '',
  set: (value: string) => emit('update:modelValue', value.trim() === '' ? null : value),
})

async function selectOption(option: UiSelectOption) {
  isCustomMode.value = Boolean(option.isCustom)

  if (option.isCustom) {
    textValue.value = ''
    close()
    await nextTick()
    inputRef.value?.focus()
    return
  }

  textValue.value = option.label
  close()
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
    <div :class="$style.shell">
      <input
        ref="inputRef"
        :class="[$style.input, isCustomMode && $style.inputEditable]"
        :value="textValue"
        :readonly="!isCustomMode"
        :placeholder="isCustomMode ? customPlaceholder : placeholder"
        @input="textValue = ($event.target as HTMLInputElement).value"
        @click.stop="onInputClick"
      />
      <button type="button" :class="$style.toggle" aria-label="Открыть список" @click.stop="toggle">
        <UIcon name="i-arrow-chevron-dropdown" :class="$style.icon" aria-hidden="true" />
      </button>
    </div>

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
  gap: var(--fs-space-1);
}

.input {
  @include field.ui-control-text;
  flex: 1;
  cursor: pointer;
}

.inputEditable {
  cursor: text;
}

.toggle {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.icon {
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
