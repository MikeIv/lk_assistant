<script setup lang="ts">
const props = defineProps<{
  open: boolean
  text: string
  isSubmitting: boolean
  error: string | null
  success: boolean
}>()

const emit = defineEmits<{
  'update:text': [value: string]
  close: []
  submit: []
}>()

const localText = computed({
  get: () => props.text,
  set: (value: string) => emit('update:text', value),
})

const isOverLimit = computed(() => localText.value.length >= 255)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="$style.overlay" @mousedown.self="emit('close')">
      <div :class="$style.dialog" role="dialog" aria-modal="true" aria-labelledby="reports-correction-title">
        <template v-if="!success">
          <h3 id="reports-correction-title" :class="$style.title">Запросить исправление</h3>
          <p :class="$style.subtitle">Укажите причину для редактирования отчёта:</p>
          <textarea
            v-model="localText"
            :class="$style.textarea"
            rows="3"
            maxlength="255"
            placeholder="Введите комментарий"
            :disabled="isSubmitting"
          />
          <p :class="[$style.counter, { [$style.counterError]: isOverLimit }]">
            {{ localText.length }} / 255
          </p>
        </template>

        <p v-else :class="$style.success">Запрос успешно отправлен</p>

        <p v-if="error" :class="$style.error">{{ error }}</p>

        <div :class="$style.actions">
          <UiButton
            v-if="!success"
            size="sm"
            variant="primary"
            label="Отправить"
            :disabled="isSubmitting || localText.trim().length === 0"
            :loading="isSubmitting"
            @click="emit('submit')"
          />
          <UiButton
            size="sm"
            variant="outline"
            :label="success ? 'Закрыть' : 'Отмена'"
            :disabled="isSubmitting"
            @click="emit('close')"
          />
        </div>
      </div>
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
  width: min(100%, rem(420));
  padding: var(--fs-space-3);
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.title {
  margin: 0 0 var(--fs-space-1);

  @include typo.fs-text-h4;
}

.subtitle {
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
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

.counter {
  margin: rem(4) 0 0;
  font-size: rem(12);
  color: var(--fs-color-text-muted);
  text-align: right;
}

.counterError {
  color: var(--fs-color-error);
}

.success {
  margin: 0;

  @include typo.fs-text-h5-subtitle;
}

.error {
  margin: var(--fs-space-2) 0 0;
  color: var(--fs-color-error);
  font-size: rem(13);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  margin-top: var(--fs-space-2);
}
</style>
