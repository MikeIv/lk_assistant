<script setup lang="ts">
export interface ReportPeriodFilterValue {
  start: string
  end: string
}

const props = defineProps<{
  modelValue: ReportPeriodFilterValue | null
  open: boolean
  style?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReportPeriodFilterValue | null]
  apply: []
}>()

const start = ref('')
const end = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      start.value = props.modelValue?.start ?? ''
      end.value = props.modelValue?.end ?? ''
    }
  },
)

function apply() {
  if (!start.value || !end.value) {
    emit('update:modelValue', null)
  } else {
    emit('update:modelValue', { start: start.value, end: end.value })
  }

  emit('apply')
}

function clear() {
  start.value = ''
  end.value = ''
  emit('update:modelValue', null)
  emit('apply')
}
</script>

<template>
  <div v-show="open" :class="$style.panel" :style="style" role="dialog" aria-label="Фильтр по периоду" @click.stop>
    <div :class="$style.field">
      <label :class="$style.fieldLabel" for="reports-period-from">С</label>
      <input id="reports-period-from" v-model="start" type="date" :class="$style.input" />
    </div>
    <div :class="$style.field">
      <label :class="$style.fieldLabel" for="reports-period-to">По</label>
      <input id="reports-period-to" v-model="end" type="date" :class="$style.input" />
    </div>
    <div :class="$style.actions">
      <UiButton size="sm" variant="primary" label="Применить" fit @click="apply" />
      <UiButton size="sm" variant="outline" label="Сбросить" fit @click="clear" />
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.panel {
  position: absolute;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  min-width: rem(240);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(12);
  background-color: var(--fs-color-bg);
  box-shadow: 0 rem(8) rem(24) rgb(23 23 32 / 0.08);
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(4);
}

.fieldLabel {
  font-size: rem(12);
  font-weight: 500;
  color: var(--fs-color-text-muted);
}

.input {
  box-sizing: border-box;
  width: 100%;
  padding: rem(8) rem(10);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(8);
  font: inherit;
  color: var(--fs-color-text);
  background-color: var(--fs-color-bg);

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}
</style>
