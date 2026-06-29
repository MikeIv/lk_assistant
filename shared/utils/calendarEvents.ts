import { addDays, compareAsc, parseISO, startOfDay } from 'date-fns'

import type { CalendarEvent } from '#shared/types/calendar'

export type CalendarDateRange = {
  start: Date
  /** Exclusive boundary (как в FullCalendar). */
  end: Date
}

function toDate(value: CalendarEvent['start'] | CalendarEvent['end']): Date | null {
  if (value == null) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === 'number') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  return null
}

function getEventRange(event: CalendarEvent): CalendarDateRange | null {
  const start = toDate(event.start)
  if (!start) {
    return null
  }

  const rawEnd = toDate(event.end) ?? start

  if (event.allDay) {
    const rangeStart = startOfDay(start)
    let rangeEnd = startOfDay(rawEnd)

    if (!event.end || rangeEnd <= rangeStart) {
      rangeEnd = startOfDay(addDays(rangeStart, 1))
    }

    return { start: rangeStart, end: rangeEnd }
  }

  return { start, end: rawEnd > start ? rawEnd : new Date(start.getTime() + 1) }
}

function rangesOverlap(a: CalendarDateRange, b: CalendarDateRange): boolean {
  return a.start < b.end && a.end > b.start
}

export function filterEventsByRange(
  events: CalendarEvent[],
  range: CalendarDateRange,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventRange = getEventRange(event)
      return eventRange ? rangesOverlap(eventRange, range) : false
    })
    .sort((left, right) => {
      const leftStart = toDate(left.start)
      const rightStart = toDate(right.start)

      if (!leftStart || !rightStart) {
        return 0
      }

      return compareAsc(leftStart, rightStart)
    })
}

export function getEventStartDate(event: CalendarEvent): Date | null {
  return toDate(event.start)
}

export function findCalendarEventById(
  events: CalendarEvent[],
  id: string | number,
): CalendarEvent | undefined {
  return events.find((event) => String(event.id) === String(id))
}
