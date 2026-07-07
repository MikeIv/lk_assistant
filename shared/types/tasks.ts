export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  color?: string
}

export type TaskDraft = Omit<Task, 'id'>

export type TaskColumnDefinition = {
  status: TaskStatus
  label: string
  accent: string
}
