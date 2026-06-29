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

.root {
  display: flex;
  gap: var(--fs-space-3);
  width: 100%;
  min-height: rem(560);
}

.calendarMain {
  flex: 3;
  min-width: 0;
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.eventsSidebar {
  flex: 1;
  min-width: rem(240);
  max-width: rem(320);
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
  overflow-y: auto;
}

@media (max-width: 960px) {
  .root {
    flex-direction: column;
  }

  .eventsSidebar {
    max-width: none;
  }
}
</style>
