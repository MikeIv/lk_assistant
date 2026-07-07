import type { Task, TaskColumnDefinition, TaskPriority, TaskStatus } from '#shared/types/tasks'

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
}

const TASK_COLUMN_ACCENTS: Record<TaskStatus, string> = {
  todo: 'var(--fs-figma-vertical-shop)',
  in_progress: 'var(--fs-figma-vertical-entertainments)',
  done: 'var(--fs-figma-vertical-food)',
}

export const TASK_COLUMNS: TaskColumnDefinition[] = TASK_STATUSES.map((status) => ({
  status,
  label: TASK_STATUS_LABELS[status],
  accent: TASK_COLUMN_ACCENTS[status],
}))

const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#3b82f6',
  medium: '#ee7d00',
  high: '#d9412a',
}

export function getTaskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_LABELS[status]
}

export function getTaskPriorityLabel(priority: TaskPriority): string {
  return TASK_PRIORITY_LABELS[priority]
}

export function getTaskPriorityColor(priority: TaskPriority): string {
  return TASK_PRIORITY_COLORS[priority]
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    done: [],
  }

  for (const task of tasks) {
    grouped[task.status].push(task)
  }

  return grouped
}

export function mergeColumnTasks(columnTasks: Record<TaskStatus, Task[]>): Task[] {
  const merged: Task[] = []

  for (const status of TASK_STATUSES) {
    merged.push(...columnTasks[status].map((task) => ({ ...task, status })))
  }

  return merged
}

export function parseTaskDueDate(value: string | undefined): Date | null {
  if (!value?.trim()) {
    return null
  }

  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function toTaskSelectOptions<T extends string>(
  values: readonly T[],
  getLabel: (value: T) => string,
) {
  return values.map((value) => ({
    value,
    label: getLabel(value),
    outputValue: value,
  }))
}
