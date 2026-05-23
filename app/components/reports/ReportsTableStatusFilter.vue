<script setup lang="ts">
import { REPORT_STATUS_FILTER_OPTIONS } from '#shared/constants/reportsStatus'
import type { ReportStatus } from '#shared/types/reports'

const props = defineProps<{
  modelValue: ReportStatus[]
  open: boolean
  style?: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReportStatus[]]
  apply: []
}>()

const draft = ref<ReportStatus[]>([...props.modelValue])

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      draft.value = [...props.modelValue]
    }
  },
)

function toggleStatus(status: ReportStatus, checked: boolean) {
  if (checked) {
    draft.value = [...draft.value, status]
    return
  }

  draft.value = draft.value.filter((item) => item !== status)
}

function apply() {
  emit('update:modelValue', [...draft.value])
  emit('apply')
}

function isChecked(status: ReportStatus): boolean {
  return draft.value.includes(status)
}
</script>

<template>
  <div v-show="open" :class="$style.panel" :style="style" role="dialog" aria-label="Фильтр по статусу" @click.stop>
    <ul :class="$style.list">
      <li v-for="option in REPORT_STATUS_FILTER_OPTIONS" :key="option.value" :class="$style.item">
        <label :class="$style.label">
          <input
            type="checkbox"
            :class="$style.checkbox"
            :checked="isChecked(option.value)"
            @change="toggleStatus(option.value, ($event.target as HTMLInputElement).checked)"
          />
          <span>{{ option.label }}</span>
        </label>
      </li>
    </ul>
    <UiButton size="sm" variant="primary" label="Применить" fit @click="apply" />
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

.list {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  margin: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: var(--fs-space-1);
  font-size: rem(13);
  color: var(--fs-color-text);
  cursor: pointer;
}

.checkbox {
  width: rem(16);
  height: rem(16);
  accent-color: var(--fs-color-button-on-light);
}
</style>
