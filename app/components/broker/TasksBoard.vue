<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

import type { Task, TaskStatus } from '#shared/types/tasks'
import {
  TASK_COLUMNS,
  getTaskPriorityColor,
  getTaskPriorityLabel,
  groupTasksByStatus,
  mergeColumnTasks,
} from '#shared/utils/tasks'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  'update:tasks': [tasks: Task[]]
  'edit-task': [task: Task]
}>()

const columnTasks = reactive<Record<TaskStatus, Task[]>>({
  todo: [],
  in_progress: [],
  done: [],
})

const isCommitting = ref(false)

function hydrateColumns() {
  const grouped = groupTasksByStatus(props.tasks)

  for (const column of TASK_COLUMNS) {
    columnTasks[column.status] = grouped[column.status]
  }
}

watch(
  () => props.tasks,
  () => {
    if (isCommitting.value) {
      return
    }

    hydrateColumns()
  },
  { immediate: true, deep: true },
)

function commitColumns() {
  isCommitting.value = true
  emit('update:tasks', mergeColumnTasks(columnTasks))
  nextTick(() => {
    isCommitting.value = false
  })
}

function taskAccent(task: Task): string {
  return task.color ?? getTaskPriorityColor(task.priority)
}
</script>

<template>
  <div :class="$style.root">
    <section
      v-for="column in TASK_COLUMNS"
      :key="column.status"
      :class="$style.column"
      :aria-label="column.label"
    >
      <header :class="$style.columnHeader" :style="{ '--column-accent': column.accent }">
        <h3 :class="$style.columnTitle">{{ column.label }}</h3>
        <span :class="$style.columnCount">{{ columnTasks[column.status].length }}</span>
      </header>

      <VueDraggable
        v-model="columnTasks[column.status]"
        :class="$style.columnBody"
        group="broker-tasks"
        :animation="150"
        :delay="120"
        ghost-class="broker-task-ghost"
        @change="commitColumns"
      >
        <article
          v-for="task in columnTasks[column.status]"
          :key="task.id"
          :class="$style.card"
          :style="{ '--task-accent': taskAccent(task) }"
        >
          <button type="button" :class="$style.cardButton" @click="emit('edit-task', task)">
            <span :class="$style.cardTitle">{{ task.title }}</span>
            <span v-if="task.description?.trim()" :class="$style.cardDescription">
              {{ task.description }}
            </span>
            <span :class="$style.cardMeta">
              {{ getTaskPriorityLabel(task.priority) }}
            </span>
          </button>
        </article>
      </VueDraggable>

      <p v-if="!columnTasks[column.status].length" :class="$style.empty">Нет задач</p>
    </section>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--fs-space-2);
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  min-width: 0;
}

.columnHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
  padding: rem(8) rem(10);
  border-left: rem(4) solid var(--column-accent);
  border-radius: rem(8);
  background: var(--fs-color-bg-muted, rgb(0 0 0 / 0.03));
}

.columnTitle {
  margin: 0;

  @include typo.fs-text-body;
  font-weight: 600;
}

.columnCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: rem(24);
  height: rem(24);
  padding: 0 rem(6);
  border-radius: rem(999);
  background: var(--fs-color-bg);
  color: var(--fs-color-text-muted);
  font-size: rem(12);
  font-weight: 600;
}

.columnBody {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fs-space-1);
  min-height: rem(120);
}

.card {
  margin: 0;
}

.cardButton {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: rem(4);
  width: 100%;
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-color-border);
  border-left: rem(4) solid var(--task-accent, var(--fs-color-primary));
  border-radius: rem(8);
  background: var(--fs-color-bg);
  text-align: left;
  cursor: grab;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--fs-color-bg-muted, rgb(0 0 0 / 0.03));
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }

  &:active {
    cursor: grabbing;
  }
}

.cardTitle {
  @include typo.fs-text-body;
  font-weight: 600;
}

.cardDescription {
  color: var(--fs-color-text-muted);
  font-size: rem(13);
  line-height: 1.4;
}

.cardMeta {
  color: var(--fs-color-text-muted);
  font-size: rem(12);
}

.empty {
  margin: 0;
  padding: rem(8) rem(4);
  color: var(--fs-color-text-muted);
  font-size: rem(13);
}

@media (max-width: bp.$tabletMax) {
  .root {
    grid-template-columns: 1fr;
  }
}
</style>

<style lang="scss">
.broker-task-ghost {
  opacity: 0.45;
}
</style>
