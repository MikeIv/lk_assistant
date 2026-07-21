<script setup lang="ts">
import type { UiButtonSize, UiButtonVariant } from '~/components/ui/UiButton.vue'

const open = defineModel<boolean>({ required: true })

const props = withDefaults(
  defineProps<{
    /** Текст сообщения (или слот default) */
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: UiButtonVariant
    cancelVariant?: UiButtonVariant
    buttonSize?: UiButtonSize
    loading?: boolean
    closeOnOverlay?: boolean
  }>(),
  {
    message: '',
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    confirmVariant: 'accent',
    cancelVariant: 'soft',
    buttonSize: 'chrome',
    loading: false,
    closeOnOverlay: true,
  },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()

function close() {
  if (props.loading) {
    return
  }
  open.value = false
  emit('cancel')
}

function onConfirm() {
  if (!props.loading) {
    emit('confirm')
  }
}

function onOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

watch(open, (isOpen, _prev, onCleanup) => {
  if (!isOpen) {
    return
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  }

  document.addEventListener('keydown', onKeydown)
  onCleanup(() => document.removeEventListener('keydown', onKeydown))
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      :class="$style.overlay"
      @mousedown.self="onOverlayClick"
    >
      <div
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <p :id="titleId" :class="$style.message">
          <slot>{{ message }}</slot>
        </p>

        <div :class="$style.actions">
          <UiButton
            type="button"
            :size="buttonSize"
            :variant="confirmVariant"
            :label="confirmLabel"
            :loading="loading"
            @click="onConfirm"
          />
          <UiButton
            type="button"
            :size="buttonSize"
            :variant="cancelVariant"
            :label="cancelLabel"
            :disabled="loading"
            @click="close"
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
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
  width: min(100%, rem(400));
  padding: var(--fs-space-3);
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.message {
  margin: 0;
  color: var(--fs-color-text);
  text-align: center;

  @include typo.fs-text-h4;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--fs-space-2);
}
</style>
