import { describe, expect, it } from 'vitest'
import {
  getTaskPriorityColor,
  getTaskPriorityLabel,
  getTaskStatusLabel,
  groupTasksByStatus,
  mergeColumnTasks,
  parseTaskDueDate,
  TASK_COLUMNS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  toTaskSelectOptions,
} from '#shared/utils/tasks'
import type { Task } from '#shared/types/tasks'

describe('tasks', () => {
  const tasks: Task[] = [
    { id: '1', title: 'A', status: 'todo', priority: 'low' },
    { id: '2', title: 'B', status: 'done', priority: 'high' },
    { id: '3', title: 'C', status: 'in_progress', priority: 'medium' },
  ]

  it('exposes labels/colors and column definitions', () => {
    expect(TASK_STATUSES).toEqual(['todo', 'in_progress', 'done'])
    expect(TASK_PRIORITIES).toHaveLength(3)
    expect(TASK_COLUMNS).toHaveLength(3)
    expect(getTaskStatusLabel('todo')).toBe('К выполнению')
    expect(getTaskPriorityLabel('high')).toBe('Высокий')
    expect(getTaskPriorityColor('low')).toMatch(/^#/)
  })

  it('groups and merges column tasks preserving status', () => {
    const grouped = groupTasksByStatus(tasks)
    expect(grouped.todo).toHaveLength(1)
    expect(grouped.done[0]?.id).toBe('2')

    const merged = mergeColumnTasks({
      todo: [{ id: 'x', title: 'X', status: 'done', priority: 'low' }],
      in_progress: [],
      done: [],
    })
    expect(merged[0]?.status).toBe('todo')
  })

  it('parses due dates and builds select options', () => {
    expect(parseTaskDueDate(undefined)).toBeNull()
    expect(parseTaskDueDate('  ')).toBeNull()
    expect(parseTaskDueDate('2026-07-28')?.getDate()).toBe(28)
    expect(toTaskSelectOptions(TASK_PRIORITIES, getTaskPriorityLabel)[0]).toMatchObject({
      value: 'low',
      label: 'Низкий',
      outputValue: 'low',
    })
  })
})
