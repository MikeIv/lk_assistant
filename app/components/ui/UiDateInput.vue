<script setup lang="ts">
const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    id?: string
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    id: '',
    disabled: false,
    placeholder: 'дд.мм.гггг',
  },
)

const inputRef = ref<HTMLInputElement | null>(null)
const inputId = computed(() => props.id || undefined)
const isFilled = computed(() => model.value.trim().length > 0)

function onInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value
}

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
  <div
    :class="[
      $style.shell,
      !isFilled && $style.isEmpty,
      props.disabled && $style.isDisabled,
    ]"
  >
    <input
      :id="inputId"
      ref="inputRef"
      :class="$style.input"
      type="date"
      :value="model"
      :disabled="props.disabled"
      @input="onInput"
    />
    <span v-if="!isFilled" :class="$style.placeholder" aria-hidden="true">
      {{ props.placeholder }}
    </span>
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
  position: relative;
  gap: rem(8);
  overflow: visible;
}

.isEmpty .input::-webkit-datetime-edit,
.isEmpty .input::-webkit-datetime-edit-fields-wrapper,
.isEmpty .input::-webkit-datetime-edit-day-field,
.isEmpty .input::-webkit-datetime-edit-month-field,
.isEmpty .input::-webkit-datetime-edit-year-field {
  opacity: 0;
}

.placeholder {
  @include field.ui-control-text;
  position: absolute;
  inset: 0 rem(44) 0 rem(24);
  display: flex;
  align-items: center;
  pointer-events: none;
  color: var(--fs-figma-achromatic-middle-gray);
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
