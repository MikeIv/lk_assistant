<script setup lang="ts">
export type TenantCaseCardTab = 'room' | 'applicants' | 'kp'

const TAB_ITEMS: Array<{ id: TenantCaseCardTab; label: string }> = [
  { id: 'room', label: 'Помещение' },
  { id: 'applicants', label: 'Претенденты' },
  { id: 'kp', label: 'Коммерческие предложения' },
]

const model = defineModel<TenantCaseCardTab>({ required: true })
</script>

<template>
  <div :class="$style.root" role="tablist" aria-label="Разделы карточки дела">
    <button
      v-for="tab in TAB_ITEMS"
      :key="tab.id"
      type="button"
      role="tab"
      :class="[$style.tab, model === tab.id && $style.tabActive]"
      :aria-selected="model === tab.id"
      @click="model = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

/* Figma UI Kit Switch — компактный вариант (высота таба 38). */
.root {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: rem(2);
  width: fit-content;
  max-width: 100%;
  padding: rem(3);
  border: rem(1) solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(99);
  background-color: var(--fs-figma-achromatic-white);
}

.tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: rem(38);
  min-height: rem(38);
  margin: 0;
  padding: rem(4) rem(14);
  border: 0;
  border-radius: rem(99);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  text-align: center;

  @include typo.fs-text-tag;

  color: var(--fs-figma-achromatic-dark-gray);
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }

  &:hover:not(.tabActive) {
    color: var(--fs-figma-achromatic-black);
  }
}

.tabActive {
  color: var(--fs-figma-achromatic-white);
  background-color: var(--fs-figma-achromatic-dark-gray);
  box-shadow: 0 0 rem(5) rgb(0 0 0 / 0.18);
}
</style>
