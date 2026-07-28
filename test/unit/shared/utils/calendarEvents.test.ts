import { describe, expect, it } from 'vitest'
import {
  filterEventsByRange,
  findCalendarEventById,
  getEventStartDate,
} from '#shared/utils/calendarEvents'
import type { CalendarEvent } from '#shared/types/calendar'

describe('calendarEvents', () => {
  const events: CalendarEvent[] = [
    { id: '1', title: 'Timed', start: '2026-07-10T10:00:00', end: '2026-07-10T11:00:00' },
    { id: 2, title: 'All day', start: '2026-07-12', allDay: true },
    { id: '3', title: 'Broken', start: 'not-a-date' },
  ]

  it('filters overlapping events and sorts by start', () => {
    const filtered = filterEventsByRange(events, {
      start: new Date(2026, 6, 9),
      end: new Date(2026, 6, 13),
    })

    expect(filtered.map((e) => String(e.id))).toEqual(['1', '2'])
  })

  it('excludes non-overlapping and invalid starts', () => {
    expect(
      filterEventsByRange(events, {
        start: new Date(2026, 6, 20),
        end: new Date(2026, 6, 21),
      }),
    ).toEqual([])
  })

  it('gets start date and finds by id with string coercion', () => {
    expect(getEventStartDate(events[0]!)?.getDate()).toBe(10)
    expect(getEventStartDate(events[2]!)).toBeNull()
    expect(findCalendarEventById(events, 2)?.title).toBe('All day')
    expect(findCalendarEventById(events, '1')?.title).toBe('Timed')
  })
})
