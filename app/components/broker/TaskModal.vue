<script setup lang="ts">
import { format } from 'date-fns'

import type { Task, TaskDraft, TaskPriority, TaskStatus } from '#shared/types/tasks'
import type { UiSelectOption } from '#shared/types/tenantData'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  getTaskPriorityColor,
  getTaskPriorityLabel,
  getTaskStatusLabel,
  parseTaskDueDate,
  toTaskSelectOptions,
} from '#shared/utils/tasks'

const props = defineProps<{
  modelValue: boolean
  taskToEdit: Task | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [task: TaskDraft]
  close: []
}>()

const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('todo')
const priority = ref<TaskPriority>('medium')
const dueDate = ref('')
const color = ref('')

const isEditing = computed(() => props.taskToEdit !== null)

const dialogTitle = computed(() => (isEditing.value ? 'Редактировать задачу' : 'Новая задача'))

const statusOptions = computed<UiSelectOption[]>(() =>
  toTaskSelectOptions(TASK_STATUSES, getTaskStatusLabel),
)

const priorityOptions = computed<UiSelectOption[]>(() =>
  toTaskSelectOptions(TASK_PRIORITIES, getTaskPriorityLabel),
)

function resetForm() {
  title.value = String(props.taskToEdit?.title ?? '')
  description.value = props.taskToEdit?.description ?? ''
  status.value = props.taskToEdit?.status ?? 'todo'
  priority.value = props.taskToEdit?.priority ?? 'medium'
  dueDate.value = props.taskToEdit?.dueDate ?? ''
  color.value =
    typeof props.taskToEdit?.color === 'string'
      ? props.taskToEdit.color
      : getTaskPriorityColor(priority.value)
}

watch(
  () => [props.modelValue, props.taskToEdit] as const,
  ([open]) => {
    if (open) {
      resetForm()
    }
  },
)

watch(priority, (value) => {
  if (!props.taskToEdit?.color) {
    color.value = getTaskPriorityColor(value)
  }
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function submit() {
  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) {
    return
  }

  emit('save', {
    title: trimmedTitle,
    description: description.value.trim() || undefined,
    status: status.value,
    priority: priority.value,
    dueDate: dueDate.value.trim() || undefined,
    color: color.value || getTaskPriorityColor(priority.value),
  })
}

const formattedDueDate = computed(() => {
  const parsed = parseTaskDueDate(dueDate.value)
  return parsed ? format(parsed, 'dd.MM.yyyy') : ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="broker-task-modal-title"
        @submit.prevent="submit"
      >
        <h3 id="broker-task-modal-title" :class="$style.title">{{ dialogTitle }}</h3>
        <p v-if="formattedDueDate" :class="$style.subtitle">Срок: {{ formattedDueDate }}</p>

        <label :class="$style.field">
          <span :class="$style.label">Название</span>
          <UiInput v-model="title" placeholder="Введите название" />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Описание</span>
          <textarea
            v-model="description"
            :class="$style.textarea"
            rows="3"
            placeholder="Необязательно"
          />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Статус</span>
          <UiSelect v-model="status" :options="statusOptions" />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Приоритет</span>
          <UiSelect v-model="priority" :options="priorityOptions" />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Срок</span>
          <input v-model="dueDate" :class="$style.dateInput" type="date" />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Цвет</span>
          <input v-model="color" :class="$style.colorInput" type="color" />
        </label>

        <div :class="$style.actions">
          <UiButton type="submit" size="sm" variant="primary" label="Сохранить" />
          <UiButton type="button" size="sm" variant="outline" label="Отмена" @click="close" />
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fs-space-2);
  background: rgb(23 23 32 / 0.45);
}

.dialog {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: min(100%, rem(420));
  padding: var(--fs-space-3);
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.title {
  margin: 0;

  @include typo.fs-text-h4;
}

.subtitle {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.label {
  font-size: rem(13);
  font-weight: 600;
  color: var(--fs-color-text);
}

.textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: rem(88);
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(8);
  font: inherit;
  color: var(--fs-color-text);
  resize: vertical;

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.dateInput {
  box-sizing: border-box;
  width: 100%;
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(8);
  font: inherit;
  color: var(--fs-color-text);

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.colorInput {
  width: rem(48);
  height: rem(32);
  padding: 0;
  border: 1px solid var(--fs-color-border);
  border-radius: rem(6);
  cursor: pointer;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}
</style>
