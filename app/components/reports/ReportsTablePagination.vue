<script setup lang="ts">
import { getVisiblePageNumbers } from '#shared/utils/reportsFormat'

const props = defineProps<{
  currentPage: number
  lastPage: number
}>()

const emit = defineEmits<{
  pageChange: [page: number]
}>()

const pages = computed(() => getVisiblePageNumbers(props.currentPage, props.lastPage))

function goTo(page: number | 'ellipsis') {
  if (page === 'ellipsis') {
    return
  }

  emit('pageChange', page)
}

function goPrev() {
  if (props.currentPage > 1) {
    emit('pageChange', props.currentPage - 1)
  }
}

function goNext() {
  if (props.currentPage < props.lastPage) {
    emit('pageChange', props.currentPage + 1)
  }
}
</script>

<template>
  <nav :class="$style.root" aria-label="Пагинация отчётов">
    <button
      type="button"
      :class="[$style.arrow, { [$style.arrowDisabled]: currentPage <= 1 }]"
      :disabled="currentPage <= 1"
      aria-label="Предыдущая страница"
      @click="goPrev"
    >
      <UIcon name="i-arrow-bold-left" :class="$style.arrowIcon" aria-hidden="true" />
    </button>

    <div :class="$style.pages">
      <button
        v-for="(page, index) in pages"
        :key="`${page}-${index}`"
        type="button"
        :class="[
          $style.page,
          {
            [$style.pageActive]: page !== 'ellipsis' && page === currentPage,
            [$style.pageEllipsis]: page === 'ellipsis',
          },
        ]"
        :disabled="page === 'ellipsis'"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goTo(page)"
      >
        {{ page === 'ellipsis' ? '⋯' : page }}
      </button>
    </div>

    <button
      type="button"
      :class="[$style.arrow, { [$style.arrowDisabled]: currentPage >= lastPage }]"
      :disabled="currentPage >= lastPage"
      aria-label="Следующая страница"
      @click="goNext"
    >
      <UIcon name="i-arrow-bold-right" :class="$style.arrowIcon" aria-hidden="true" />
    </button>
  </nav>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  display: flex;
  align-items: center;
  gap: var(--fs-space-2);
}

.arrow {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(58);
  height: rem(58);
  padding: 0;
  border: none;
  border-radius: rem(40);
  color: var(--fs-color-text);
  background-color: var(--fs-figma-achromatic-white);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--fs-figma-achromatic-light-gray);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.arrowDisabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.arrowIcon {
  width: rem(16);
  height: rem(16);
}

.pages {
  display: flex;
  align-items: center;
}

.page {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(58);
  height: rem(58);
  padding: rem(2) 0 rem(1);
  border: none;
  border-radius: rem(49);
  color: var(--fs-figma-achromatic-black);
  background: transparent;
  cursor: pointer;

  @include typo.fs-text-footer-number-text;

  letter-spacing: -0.01em;

  &:hover:not(:disabled):not(.pageActive) {
    background-color: rgb(23 23 32 / 0.06);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.pageActive {
  color: var(--fs-figma-achromatic-white);
  background-color: var(--fs-figma-achromatic-black);
}

.pageEllipsis {
  cursor: default;
}

@media (max-width: #{bp.$tablet - 1px}) {
  .arrow,
  .page {
    width: rem(44);
    height: rem(44);
  }
}
</style>
