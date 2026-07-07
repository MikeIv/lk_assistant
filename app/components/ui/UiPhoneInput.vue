<script setup lang="ts">
import {
  extractNationalPhoneDigits,
  formatRussianPhone,
  NATIONAL_PHONE_DIGITS_LENGTH,
  RUSSIAN_PHONE_PLACEHOLDER,
} from '#shared/utils/russianPhone'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    id?: string
    disabled?: boolean
    readonly?: boolean
  }>(),
  {
    modelValue: null,
    id: '',
    disabled: false,
    readonly: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  blur: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const nationalDigits = ref('')

const NAVIGATION_KEYS = new Set(['Tab', 'Escape', 'Enter', 'ArrowRight', 'ArrowDown', 'End'])

const displayValue = computed(() => {
  if (!nationalDigits.value.length) {
    return isFocused.value ? '+7 (' : ''
  }

  return formatRussianPhone(nationalDigits.value)
})

watch(
  () => props.modelValue,
  (value) => {
    if (isFocused.value) {
      return
    }

    nationalDigits.value = extractNationalPhoneDigits(value)
  },
  { immediate: true },
)

function isModifierKey(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey
}

function moveCursorToEnd() {
  nextTick(() => {
    const input = inputRef.value
    if (!input) {
      return
    }

    const length = input.value.length
    input.setSelectionRange(length, length)
  })
}

function emitValue() {
  emit('update:modelValue', nationalDigits.value.length ? formatRussianPhone(nationalDigits.value) : null)
}

function setNationalDigits(nextDigits: string) {
  nationalDigits.value = nextDigits.slice(0, NATIONAL_PHONE_DIGITS_LENGTH)
  emitValue()
  moveCursorToEnd()
}

function onKeyDown(event: KeyboardEvent) {
  if (props.disabled || props.readonly) {
    return
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    setNationalDigits(nationalDigits.value.slice(0, -1))
    return
  }

  if (/\d/.test(event.key)) {
    event.preventDefault()

    if (nationalDigits.value.length < NATIONAL_PHONE_DIGITS_LENGTH) {
      setNationalDigits(nationalDigits.value + event.key)
    }

    return
  }

  if (NAVIGATION_KEYS.has(event.key) || isModifierKey(event)) {
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'Home') {
    event.preventDefault()
    moveCursorToEnd()
    return
  }

  if (event.key.length === 1) {
    event.preventDefault()
  }
}

function onInput() {
  moveCursorToEnd()
}

function onPaste(event: ClipboardEvent) {
  if (props.disabled || props.readonly) {
    return
  }

  event.preventDefault()
  setNationalDigits(extractNationalPhoneDigits(event.clipboardData?.getData('text') ?? ''))
}

function onFocusIn() {
  if (props.disabled || props.readonly) {
    return
  }

  isFocused.value = true
  nationalDigits.value = extractNationalPhoneDigits(props.modelValue)
  moveCursorToEnd()
}

function onBlur() {
  isFocused.value = false
  emitValue()

  nextTick(() => {
    emit('blur')
  })
}
</script>

<template>
  <div
    :class="[
      $style.shell,
      (disabled || readonly) && $style.isStatic,
      displayValue.trim().length > 0 && !disabled && !readonly && $style.isFilled,
    ]"
    @focusin="onFocusIn"
  >
    <input
      :id="id || undefined"
      ref="inputRef"
      :class="$style.input"
      :value="displayValue"
      :placeholder="RUSSIAN_PHONE_PLACEHOLDER"
      inputmode="numeric"
      autocomplete="tel"
      :readonly="readonly"
      :disabled="disabled"
      @keydown="onKeyDown"
      @input="onInput"
      @paste="onPaste"
      @click="moveCursorToEnd"
      @blur="onBlur"
    />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/form-field' as field;

.shell {
  @include field.ui-control-shell;
}

.isStatic {
  border-color: var(--fs-figma-achromatic-light-gray);
}

.isFilled {
  @include field.ui-control-shell-filled;
}

.input {
  @include field.ui-control-text;
}
</style>
