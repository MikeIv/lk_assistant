<script setup lang="ts">
import type { Task, TaskDraft } from '#shared/types/tasks'

const showTaskModal = ref(false)
const taskToEdit = ref<Task | null>(null)

const tasks = ref<Task[]>([
  {
    id: '1',
    title: 'Согласовать договор аренды',
    description: 'Отправить правки юристу',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-07-12',
    color: '#d9412a',
  },
  {
    id: '2',
    title: 'Подготовить презентацию объекта',
    description: 'Для встречи с арендатором',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2026-07-09',
    color: '#ee7d00',
  },
  {
    id: '3',
    title: 'Обновить карточку помещения',
    status: 'done',
    priority: 'low',
    dueDate: '2026-07-05',
    color: '#009640',
  },
])

function openTaskModal() {
  showTaskModal.value = true
}

function closeModal() {
  showTaskModal.value = false
  taskToEdit.value = null
}

function editTask(task: Task) {
  taskToEdit.value = task
  showTaskModal.value = true
}

function handleSaveTask(draft: TaskDraft) {
  const editingId = taskToEdit.value?.id

  if (editingId != null) {
    const index = tasks.value.findIndex((task) => task.id === editingId)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...draft, id: editingId }
    }
  } else {
    tasks.value.push({ ...draft, id: Date.now().toString() })
  }

  closeModal()
}
</script>

<template>
  <section :class="$style.root">
    <div :class="$style.boardMain">
      <BrokerTasksBoard v-model:tasks="tasks" @edit-task="editTask" />
    </div>

    <div :class="$style.tasksSidebar">
      <BrokerTasksList :tasks="tasks" @add-task="openTaskModal" @edit-task="editTask" />
    </div>

    <BrokerTaskModal
      v-model="showTaskModal"
      :task-to-edit="taskToEdit"
      @save="handleSaveTask"
      @close="closeModal"
    />
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  display: flex;
  gap: var(--fs-space-3);
  align-items: flex-start;
  width: 100%;
}

.boardMain {
  flex: 1 1 auto;
  width: 100%;
  max-width: bp.$desktopMin;
  min-width: 0;
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.tasksSidebar {
  flex: 1 1 rem(280);
  min-width: rem(240);
  max-width: rem(320);
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
  overflow-y: auto;
}

@media (min-width: bp.$desktopMin) {
  .root {
    gap: var(--fs-space-2);
  }

  .boardMain,
  .tasksSidebar {
    padding: var(--fs-space-1) var(--fs-space-2);
  }
}

@media (max-width: bp.$tabletMax) {
  .root {
    flex-direction: column;
  }

  .boardMain {
    max-width: none;
  }

  .tasksSidebar {
    flex: 1 1 auto;
    max-width: none;
  }
}
</style>
