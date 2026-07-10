<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    id?: string
    disabled?: boolean
  }>(),
  {
    id: '',
    disabled: false,
  },
)

const inputRef = ref<HTMLInputElement | null>(null)
const inputId = computed(() => props.id || undefined)

function openPicker() {
  if (props.disabled || !inputRef.value) {
    return
  }

  try {
    inputRef.value.showPicker()
  } catch {
    inputRef.value.focus()
  }
}
</script>

<template>
  <div :class="[$style.shell, props.disabled && $style.isDisabled]">
    <input
      :id="inputId"
      ref="inputRef"
      v-model="model"
      :class="$style.input"
      type="date"
      :disabled="props.disabled"
    />
    <button
      type="button"
      :class="$style.iconBtn"
      :disabled="props.disabled"
      tabindex="-1"
      aria-hidden="true"
      @click="openPicker"
    >
      <UIcon name="i-local-calendar" :class="$style.icon" />
    </button>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/form-field' as field;

.shell {
  @include field.ui-input-control-shell;
  gap: rem(8);
  overflow: visible;
}

.isDisabled {
  opacity: 0.64;
  cursor: not-allowed;
}

.input {
  @include field.ui-control-text;
  flex: 1 1 auto;
  width: auto;
  min-width: 0;

  &::-webkit-calendar-picker-indicator {
    display: none;
  }

  &::-webkit-date-and-time-value {
    text-align: start;
  }
}

.iconBtn {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: rem(28);
  height: rem(28);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: rem(8);
  background: transparent;
  color: var(--fs-figma-achromatic-dark-gray);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

.icon {
  display: block;
  flex-shrink: 0;
  width: rem(22);
  height: rem(22);
}
</style>
