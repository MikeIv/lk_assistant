<script setup lang="ts">
const { items, isDirectoryNavActive } = useCabinetDirectoriesNav()
</script>

<template>
  <nav :class="$style.root" aria-label="Подразделы справочников">
    <div :class="$style.segment">
      <UiNavButton
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :accent="item.accent"
        :active="isDirectoryNavActive(item.to)"
      />
    </div>
  </nav>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  width: 100%;
  min-width: 0;
}

.segment {
  display: flex;
  flex-wrap: nowrap;
  gap: rem(4);
  width: max-content;
  max-width: 100%;
  min-width: 0;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
