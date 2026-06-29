import type { EventInput } from '@fullcalendar/core'

export type CalendarEventExtendedProps = {
  description?: string
}

export type CalendarEvent = EventInput & {
  extendedProps?: CalendarEventExtendedProps
}

export type CalendarEventDraft = {
  title: string
  start: string
  end?: string
  allDay: boolean
  color: string
  extendedProps?: CalendarEventExtendedProps
}
