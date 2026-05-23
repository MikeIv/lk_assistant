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
        <UiButton
          size="sm"
          variant="outline"
          icon="i-arrow-chevron-down"
          :icon-size="20"
          aria-label="Скачать файл"
          fit
          @click="onDownload"
        />
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
  gap: var(--fs-space-1);
}

.hiddenInput {
  display: none;
}

.card {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fs-space-2);
  width: 100%;
  max-width: rem(520);
  min-height: rem(68);
  padding: var(--fs-space-2);
  border-radius: rem(16);
  background-color: var(--fs-figma-achromatic-light-gray);
}

.fileIcon {
  flex-shrink: 0;
  width: rem(24);
  height: rem(24);
  color: var(--fs-figma-achromatic-dark-gray);
}

.meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: rem(4);
  min-width: rem(160);
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
