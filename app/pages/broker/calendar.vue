<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import ruLocale from '@fullcalendar/core/locales/ru'
import type { CalendarOptions, DatesSetArg, EventClickArg } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'

import type { CalendarEvent, CalendarEventDraft } from '#shared/types/calendar'
import {
  filterEventsByRange,
  findCalendarEventById,
  type CalendarDateRange,
} from '#shared/utils/calendarEvents'

const calendarPlugins = [dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]

const selectedDate = ref(new Date())
const showEventModal = ref(false)
const eventToEdit = ref<CalendarEvent | null>(null)

const visibleRange = ref<CalendarDateRange | null>(null)
const visiblePeriodLabel = ref('')

const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: 'Встреча с клиентом',
    start: '2026-06-29',
    end: '2026-06-30',
    allDay: true,
    color: '#3b82f6',
    extendedProps: { description: 'Обсудить проект myhomefab' },
  },
])

const periodEvents = computed(() =>
  visibleRange.value ? filterEventsByRange(events.value, visibleRange.value) : [],
)

function onDatesSet(info: DatesSetArg) {
  visibleRange.value = { start: info.start, end: info.end }
  visiblePeriodLabel.value = info.view.title
}

function openEventModal() {
  showEventModal.value = true
}

function closeModal() {
  showEventModal.value = false
  eventToEdit.value = null
}

function editEvent(event: CalendarEvent) {
  eventToEdit.value = event
  showEventModal.value = true
}

function handleSaveEvent(draft: CalendarEventDraft) {
  const editingId = eventToEdit.value?.id

  if (editingId != null) {
    const index = events.value.findIndex((event) => event.id === editingId)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...draft, id: editingId }
    }
  } else {
    events.value.push({ ...draft, id: Date.now().toString() })
  }

  closeModal()
}

function onDateClick(info: DateClickArg) {
  selectedDate.value = info.date
  eventToEdit.value = null
  showEventModal.value = true
}

function onEventClick(info: EventClickArg) {
  const event = findCalendarEventById(events.value, info.event.id)
  if (!event) {
    return
  }

  selectedDate.value = info.event.start ?? selectedDate.value
  eventToEdit.value = event
  showEventModal.value = true
}

function onEventDrop(info: { event: { id: string; startStr: string; endStr: string } }) {
  const event = findCalendarEventById(events.value, info.event.id)
  if (!event) {
    return
  }

  event.start = info.event.startStr
  event.end = info.event.endStr || undefined
}

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: calendarPlugins,
  initialView: 'dayGridMonth',
  locale: ruLocale,
  firstDay: 1,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  dayHeaderFormat: { weekday: 'short' },
  events: events.value,
  dateClick: onDateClick,
  eventClick: onEventClick,
  eventDrop: onEventDrop,
  datesSet: onDatesSet,
  select(info) {
    selectedDate.value = info.start
  },
}))
</script>

<template>
  <section :class="$style.root">
    <div :class="$style.calendarMain">
      <FullCalendar :options="calendarOptions" />
    </div>

    <div :class="$style.eventsSidebar">
      <BrokerCalendarEventList
        :period-label="visiblePeriodLabel"
        :events="periodEvents"
        @add-event="openEventModal"
        @edit-event="editEvent"
      />
    </div>

    <BrokerCalendarEventModal
      v-model="showEventModal"
      :selected-date="selectedDate"
      :event-to-edit="eventToEdit"
      @save="handleSaveEvent"
      @close="closeModal"
    />
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/variables/resolutions' as bp;

@mixin calendar-compact-fc {
  :global(.fc) {
    --fc-small-font-size: 0.75rem;
    font-size: rem(13);
  }

  :global(.fc .fc-toolbar) {
    flex-wrap: wrap;
    gap: rem(4);
    margin-bottom: rem(6);
  }

  :global(.fc .fc-toolbar-title) {
    font-size: rem(17);
    line-height: 1.2;
  }

  :global(.fc .fc-button) {
    padding: rem(3) rem(8);
    font-size: rem(12);
    line-height: 1.3;
  }

  :global(.fc .fc-col-header-cell-cushion) {
    padding: rem(4) rem(2);
    font-size: rem(11);
    font-weight: 600;
  }

  :global(.fc .fc-daygrid-day-number) {
    padding: rem(2) rem(4);
    font-size: rem(11);
  }

  :global(.fc .fc-daygrid-event) {
    margin-top: rem(1);
    font-size: rem(11);
  }

  :global(.fc .fc-daygrid-more-link) {
    font-size: rem(10);
  }
}

.root {
  display: flex;
  gap: var(--fs-space-3);
  align-items: flex-start;
  width: 100%;
}

.calendarMain {
  flex: 1 1 auto;
  width: 100%;
  max-width: bp.$desktopMin;
  min-width: 0;
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.eventsSidebar {
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

  .calendarMain {
    padding: var(--fs-space-1) var(--fs-space-2);

    @include calendar-compact-fc;
  }

  .eventsSidebar {
    padding: var(--fs-space-1) var(--fs-space-2);
  }
}

@media (max-width: bp.$tabletMax) {
  .root {
    flex-direction: column;
  }

  .calendarMain {
    max-width: none;
  }

  .eventsSidebar {
    flex: 1 1 auto;
    max-width: none;
  }
}
</style>
