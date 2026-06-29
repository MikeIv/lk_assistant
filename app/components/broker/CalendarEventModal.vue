<script setup lang="ts">
import { addDays, format } from 'date-fns'

import type { CalendarEvent, CalendarEventDraft } from '#shared/types/calendar'
import { getEventStartDate } from '#shared/utils/calendarEvents'

const props = defineProps<{
  modelValue: boolean
  selectedDate: Date
  eventToEdit: CalendarEvent | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [event: CalendarEventDraft]
  close: []
}>()

const title = ref('')
const description = ref('')
const color = ref('#3b82f6')

const isEditing = computed(() => props.eventToEdit !== null)

const dialogTitle = computed(() => (isEditing.value ? 'Редактировать событие' : 'Новое событие'))

const eventDate = computed(() => {
  if (props.eventToEdit) {
    return getEventStartDate(props.eventToEdit) ?? props.selectedDate
  }

  return props.selectedDate
})

const formattedDate = computed(() => format(eventDate.value, 'dd.MM.yyyy'))

function resetForm() {
  title.value = String(props.eventToEdit?.title ?? '')
  description.value = props.eventToEdit?.extendedProps?.description ?? ''
  color.value = typeof props.eventToEdit?.color === 'string' ? props.eventToEdit.color : '#3b82f6'
}

watch(
  () => [props.modelValue, props.eventToEdit, props.selectedDate] as const,
  ([open]) => {
    if (open) {
      resetForm()
    }
  },
)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function submit() {
  const trimmedTitle = title.value.trim()
  if (!trimmedTitle) {
    return
  }

  const dateKey = format(eventDate.value, 'yyyy-MM-dd')

  emit('save', {
    title: trimmedTitle,
    start: dateKey,
    end: format(addDays(eventDate.value, 1), 'yyyy-MM-dd'),
    allDay: true,
    color: color.value,
    extendedProps: {
      description: description.value.trim() || undefined,
    },
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-event-modal-title"
        @submit.prevent="submit"
      >
        <h3 id="calendar-event-modal-title" :class="$style.title">{{ dialogTitle }}</h3>
        <p :class="$style.subtitle">Дата: {{ formattedDate }}</p>

        <label :class="$style.field">
          <span :class="$style.label">Название</span>
          <UiInput v-model="title" placeholder="Введите название" />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Описание</span>
          <textarea
            v-model="description"
            :class="$style.textarea"
            rows="3"
            placeholder="Необязательно"
          />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Цвет</span>
          <input v-model="color" :class="$style.colorInput" type="color" />
        </label>

        <div :class="$style.actions">
          <UiButton type="submit" size="sm" variant="primary" label="Сохранить" />
          <UiButton type="button" size="sm" variant="outline" label="Отмена" @click="close" />
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fs-space-2);
  background: rgb(23 23 32 / 0.45);
}

.dialog {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: min(100%, rem(420));
  padding: var(--fs-space-3);
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.title {
  margin: 0;

  @include typo.fs-text-h4;
}

.subtitle {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.label {
  font-size: rem(13);
  font-weight: 600;
  color: var(--fs-color-text);
}

.textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: rem(88);
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(8);
  font: inherit;
  color: var(--fs-color-text);
  resize: vertical;

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.colorInput {
  width: rem(48);
  height: rem(32);
  padding: 0;
  border: 1px solid var(--fs-color-border);
  border-radius: rem(6);
  cursor: pointer;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}
</style>
