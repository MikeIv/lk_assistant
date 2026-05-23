<script setup lang="ts">
import {
  createMockUploadedFile,
  formatFileSize,
} from '#shared/utils/tenantDataForm'
import type { TenantUploadedFile } from '#shared/types/tenantData'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    file?: TenantUploadedFile | null
    buttonLabel?: string
    accept?: string
    readonly?: boolean
    pendingReview?: boolean
  }>(),
  {
    subtitle: '',
    file: null,
    buttonLabel: 'Добавить файл',
    accept: '.xls,.xlsx,.pdf',
    readonly: false,
    pendingReview: false,
  },
)

const emit = defineEmits<{
  select: [file: TenantUploadedFile]
  clear: []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const sizeLabel = computed(() => (props.file ? formatFileSize(props.file.size) : ''))

function openDialog() {
  if (props.readonly || props.pendingReview) {
    return
  }
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = input.files?.[0]
  if (!selected) {
    return
  }

  emit('select', createMockUploadedFile(selected, Date.now()))
  input.value = ''
}

function onDownload() {
  if (!props.file || props.file.url.startsWith('#')) {
    return
  }

  if (props.file.url.startsWith('blob:')) {
    const anchor = document.createElement('a')
    anchor.href = props.file.url
    anchor.download = props.file.name
    anchor.rel = 'noopener'
    anchor.click()
    return
  }

  window.open(props.file.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <article :class="$style.root">
    <header :class="$style.header">
      <h3 :class="$style.title">{{ title }}</h3>
      <p v-if="subtitle" :class="$style.subtitle">{{ subtitle }}</p>
    </header>

    <div :class="$style.actions">
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :class="$style.hiddenInput"
        @change="onFileChange"
      />

      <div v-if="file" :class="$style.card">
        <UIcon name="i-local-nav-report" :class="$style.fileIcon" aria-hidden="true" />
        <div :class="$style.meta">
          <p :class="$style.fileName">{{ file.name }}</p>
          <p :class="$style.fileSize">{{ sizeLabel }}</p>
        </div>
        <button
          type="button"
          :class="$style.downloadButton"
          aria-label="Скачать файл"
          @click="onDownload"
        >
          <UIcon name="i-local-download" aria-hidden="true" />
        </button>
        <UiButton
          v-if="!readonly && !pendingReview"
          size="sm"
          variant="soft"
          label="Удалить"
          fit
          @click="emit('clear')"
        />
      </div>

      <UiButton
        v-else-if="!readonly"
        size="sm"
        variant="accent"
        :label="buttonLabel"
        fit
        @click="openDialog"
      />

      <p v-else :class="$style.emptyState">{{ buttonLabel }}</p>

      <p v-if="pendingReview" :class="$style.reviewHint">Редактирование на рассмотрении</p>
    </div>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/margin' as margin;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);

  @include margin.fs-margin-end('card');
}

.header {
  display: flex;
  flex-direction: column;
  gap: rem(4);
}

.title {
  margin: 0;

  @include typo.fs-text-h5-subtitle;
  color: var(--fs-figma-achromatic-black);
}

.subtitle {
  margin: 0;

  @include typo.fs-text-body;
  color: var(--fs-figma-achromatic-middle-gray);
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--fs-space-1);
}

.hiddenInput {
  display: none;
}

.card {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: rem(12);
  width: fit-content;
  max-width: 100%;
  padding: rem(10) rem(12);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(12);
  background-color: var(--fs-figma-achromatic-white);
}

.fileIcon {
  flex-shrink: 0;
  width: rem(24);
  height: rem(24);
  color: var(--fs-figma-achromatic-dark-gray);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: rem(2);
  min-width: 0;
}

.fileName {
  margin: 0;

  @include typo.fs-text-header;
  color: var(--fs-figma-achromatic-black);
}

.fileSize {
  margin: 0;

  @include typo.fs-text-body;
  color: var(--fs-figma-achromatic-middle-gray);
}

.downloadButton {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(32);
  height: rem(32);
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fs-figma-achromatic-black);
  cursor: pointer;
  transition: color 0.16s ease;

  &:hover {
    color: var(--fs-figma-achromatic-middle-gray);
  }

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }

  :global(svg) {
    display: block;
    width: rem(32);
    height: rem(32);
  }
}

.emptyState {
  margin: 0;

  @include typo.fs-text-body;
  color: var(--fs-figma-achromatic-middle-gray);
}

.reviewHint {
  margin: 0;
  font-style: italic;

  @include typo.fs-text-body;
  color: var(--fs-color-error);
}
</style>
