<script setup lang="ts">
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { CalendarEvent } from '#shared/types/calendar'
import { getEventStartDate } from '#shared/utils/calendarEvents'

defineProps<{
  periodLabel: string
  events: CalendarEvent[]
}>()

const emit = defineEmits<{
  'add-event': []
  'edit-event': [event: CalendarEvent]
}>()

function eventDescription(event: CalendarEvent): string {
  return event.extendedProps?.description?.trim() ?? ''
}

function formatEventDate(event: CalendarEvent): string {
  const start = getEventStartDate(event)
  return start ? format(start, 'd MMMM yyyy', { locale: ru }) : ''
}
</script>

<template>
  <aside :class="$style.root" aria-labelledby="calendar-events-title">
    <header :class="$style.header">
      <h3 id="calendar-events-title" :class="$style.title">События</h3>
      <p v-if="periodLabel" :class="$style.period">{{ periodLabel }}</p>
      <UiButton size="sm" variant="primary" label="Добавить" @click="emit('add-event')" />
    </header>

    <ul v-if="events.length" :class="$style.list">
      <li v-for="event in events" :key="String(event.id)" :class="$style.item">
        <button
          type="button"
          :class="$style.eventButton"
          :style="{ '--event-color': event.color ?? 'var(--fs-color-primary)' }"
          @click="emit('edit-event', event)"
        >
          <time :class="$style.eventDate" :datetime="String(event.start ?? '')">
            {{ formatEventDate(event) }}
          </time>
          <span :class="$style.eventTitle">{{ event.title }}</span>
          <span v-if="eventDescription(event)" :class="$style.eventDescription">
            {{ eventDescription(event) }}
          </span>
        </button>
      </li>
    </ul>

    <p v-else :class="$style.empty">За этот период событий нет</p>
  </aside>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  min-height: 0;
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.title {
  margin: 0;

  @include typo.fs-text-h5-subtitle;
}

.period {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}

.list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.item {
  margin: 0;
}

.eventButton {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: rem(4);
  width: 100%;
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-color-border);
  border-left: rem(4) solid var(--event-color, var(--fs-color-primary));
  border-radius: rem(8);
  background: var(--fs-color-bg);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--fs-color-bg-muted, rgb(0 0 0 / 0.03));
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.eventDate {
  color: var(--fs-color-text-muted);
  font-size: rem(12);
  line-height: 1.3;
}

.eventTitle {
  @include typo.fs-text-body;
  font-weight: 600;
}

.eventDescription {
  color: var(--fs-color-text-muted);
  font-size: rem(13);
  line-height: 1.4;
}

.empty {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}
</style>
