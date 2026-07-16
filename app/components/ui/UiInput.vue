<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    placeholder?: string
    readonly?: boolean
    disabled?: boolean
    type?: 'text' | 'email' | 'password' | 'search'
    autocomplete?: string
    inputmode?: 'text' | 'numeric' | 'decimal' | 'email'
  }>(),
  {
    modelValue: '',
    id: '',
    placeholder: '',
    readonly: false,
    disabled: false,
    type: 'text',
    autocomplete: '',
    inputmode: 'text',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const attrs = useAttrs()
const slots = useSlots()

const inputId = computed(() => props.id || undefined)
const hasValue = computed(() => props.modelValue.trim().length > 0)
const hasTrailing = computed(() => Boolean(slots.trailing))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div
    :class="[
      $style.shell,
      hasTrailing && $style.withTrailing,
      (disabled || readonly) && $style.isStatic,
      hasValue && !disabled && !readonly && $style.isFilled,
    ]"
  >
    <input
      :id="inputId"
      v-bind="attrs"
      :class="$style.input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :inputmode="inputmode"
      :autocomplete="autocomplete || undefined"
      @input="onInput"
      @blur="emit('blur')"
    />
    <div v-if="hasTrailing" :class="$style.trailing">
      <slot name="trailing" />
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/form-field' as field;

.shell {
  @include field.ui-control-shell;
}

.withTrailing {
  gap: rem(8);
  padding-right: rem(12);
}

.isStatic {
  border-color: var(--fs-figma-achromatic-light-gray);
}

.isFilled {
  @include field.ui-control-shell-filled;
}

.input {
  @include field.ui-control-text;
  flex: 1 1 auto;
  width: auto;
}

.trailing {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
}
</style>
