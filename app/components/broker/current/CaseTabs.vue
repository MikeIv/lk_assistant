<script setup lang="ts">
export type TenantCaseCardTab = 'room' | 'applicants' | 'kp'

const TAB_ITEMS: Array<{ id: TenantCaseCardTab; label: string }> = [
  { id: 'room', label: 'Помещение' },
  { id: 'applicants', label: 'Претенденты' },
  { id: 'kp', label: 'КП' },
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

.root {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);
}

.tab {
  margin: 0;
  padding: rem(10) rem(16);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(10);
  background: var(--fs-figma-achromatic-white);
  color: var(--fs-color-text);
  cursor: pointer;

  @include typo.fs-text-body;
}

.tabActive {
  border-color: var(--fs-figma-achromatic-middle-gray);
  background: var(--fs-figma-achromatic-light-gray);
  font-weight: 600;
}
</style>
