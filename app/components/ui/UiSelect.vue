<script setup lang="ts">
import type { UiSelectOption } from '#shared/types/tenantData'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    options: UiSelectOption[]
    placeholder?: string
    disabled?: boolean
    searchable?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'Не выбрано',
    disabled: false,
    searchable: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const { wrapperRef, panelRef, panelStyle, isOpen, open, toggle, closeAfterSelection } = useUiDropdown()
const searchQuery = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const displayValue = computed(() => {
  if (!props.modelValue) {
    return ''
  }

  const matched = props.options.find(
    (option) => option.outputValue === props.modelValue || option.label === props.modelValue,
  )

  return matched?.label ?? props.modelValue
})

const visibleOptions = computed(() => {
  if (!props.searchable) {
    return props.options
  }

  const queryWords = tokenizeSearchText(searchQuery.value.trim())

  if (!queryWords.length) {
    return props.options
  }

  return props.options.filter((option) => {
    const labelWords = tokenizeSearchText(option.label)

    return queryWords.every((queryWord) =>
      labelWords.some((labelWord) => labelWord.startsWith(queryWord)),
    )
  })
})

const searchableInputValue = computed(() => {
  if (props.searchable && isOpen.value) {
    return searchQuery.value
  }

  return displayValue.value
})

function tokenizeSearchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[«»"'.,()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function isOptionSelected(option: UiSelectOption): boolean {
  const value = option.outputValue ?? option.label
  return props.modelValue === value || props.modelValue === option.label
}

const SEARCHABLE_CLOSE_OPTIONS = { suppressToggle: false, suppressOpen: true } as const

function selectOption(option: UiSelectOption) {
  emit('update:modelValue', option.outputValue ?? option.label)
  closeAfterSelection(props.searchable ? SEARCHABLE_CLOSE_OPTIONS : undefined)
}

function openSearchable() {
  if (props.disabled || isOpen.value) {
    return
  }

  searchQuery.value = ''
  open()

  nextTick(() => {
    inputRef.value?.focus()
  })
}

function onSearchableInputClick() {
  openSearchable()
}

function onSearchableInput(event: Event) {
  if (props.disabled) {
    return
  }

  searchQuery.value = (event.target as HTMLInputElement).value

  if (!isOpen.value) {
    open()
  }
}

watch(isOpen, (opened) => {
  if (!opened) {
    searchQuery.value = ''
  }
})
</script>

<template>
  <div ref="wrapperRef" :class="$style.root">
    <div
      v-if="searchable"
      :class="[$style.shell, isOpen && $style.shellOpen, disabled && $style.disabled]"
    >
      <input
        ref="inputRef"
        :class="[
          $style.searchInput,
          (searchableInputValue || isOpen) && $style.searchInputFilled,
        ]"
        :value="searchableInputValue"
        :readonly="!isOpen"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-expanded="isOpen"
        @input="onSearchableInput"
        @click.stop="onSearchableInputClick"
      />
      <button
        type="button"
        :class="$style.toggle"
        aria-label="Открыть список"
        :disabled="disabled"
        @click.stop="toggle"
      >
        <UIcon
          :name="isOpen ? 'i-arrow-chevron-dropdown-open' : 'i-arrow-chevron-dropdown'"
          :class="[$style.icon, isOpen && $style.iconOpen]"
          aria-hidden="true"
        />
      </button>
    </div>

    <button
      v-else
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

    <Teleport to="body">
      <ul
        v-if="isOpen"
        ref="panelRef"
        :class="$style.dropdown"
        :style="panelStyle"
        role="listbox"
        @mousedown.prevent
      >
        <li
          v-for="option in visibleOptions"
          :key="option.value"
          :class="[$style.option, isOptionSelected(option) && $style.optionSelected]"
          role="option"
          :aria-selected="isOptionSelected(option)"
          @click.stop="selectOption(option)"
        >
          {{ option.label }}
        </li>
        <li v-if="searchable && !visibleOptions.length" :class="$style.emptyOption">
          Ничего не найдено
        </li>
      </ul>
    </Teleport>
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

.searchInput {
  @include field.ui-dropdown-control-text;
  flex: 1;
  cursor: pointer;
}

.searchInputFilled {
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

  &:disabled {
    cursor: not-allowed;
  }
}

.emptyOption {
  padding: rem(10) rem(12);
  font-size: rem(13);
  color: var(--fs-color-text-muted);
}
</style>
