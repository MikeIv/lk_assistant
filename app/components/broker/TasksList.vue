<script setup lang="ts">
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { Task } from '#shared/types/tasks'
import {
  getTaskPriorityLabel,
  getTaskStatusLabel,
  parseTaskDueDate,
} from '#shared/utils/tasks'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  'add-task': []
  'edit-task': [task: Task]
}>()

function formatDueDate(task: Task): string {
  const dueDate = parseTaskDueDate(task.dueDate)
  return dueDate ? format(dueDate, 'd MMMM yyyy', { locale: ru }) : ''
}

const taskItems = computed(() =>
  props.tasks.map((task) => ({
    task,
    dueLabel: formatDueDate(task),
  })),
)
</script>

<template>
  <aside :class="$style.root" aria-labelledby="broker-tasks-list-title">
    <header :class="$style.header">
      <h3 id="broker-tasks-list-title" :class="$style.title">Все задачи</h3>
      <p :class="$style.subtitle">Всего: {{ tasks.length }}</p>
      <UiButton size="sm" variant="primary" label="Добавить" @click="emit('add-task')" />
    </header>

    <ul v-if="taskItems.length" :class="$style.list">
      <li v-for="{ task, dueLabel } in taskItems" :key="task.id" :class="$style.item">
        <button type="button" :class="$style.taskButton" @click="emit('edit-task', task)">
          <span :class="$style.taskTitle">{{ task.title }}</span>
          <span :class="$style.taskMeta">
            {{ getTaskStatusLabel(task.status) }} · {{ getTaskPriorityLabel(task.priority) }}
          </span>
          <time v-if="dueLabel" :class="$style.taskDue" :datetime="task.dueDate ?? ''">
            Срок: {{ dueLabel }}
          </time>
        </button>
      </li>
    </ul>

    <p v-else :class="$style.empty">Задач пока нет</p>
  </aside>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  min-height: 0;
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.title {
  margin: 0;

  @include typo.fs-text-h5-subtitle;
}

.subtitle {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}

.list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.item {
  margin: 0;
}

.taskButton {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: rem(4);
  width: 100%;
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(8);
  background: var(--fs-color-bg);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--fs-color-bg-muted, rgb(0 0 0 / 0.03));
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.taskTitle {
  @include typo.fs-text-body;
  font-weight: 600;
}

.taskMeta {
  color: var(--fs-color-text-muted);
  font-size: rem(13);
}

.taskDue {
  color: var(--fs-color-text-muted);
  font-size: rem(12);
}

.empty {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}
</style>
