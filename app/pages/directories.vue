<script setup lang="ts">
const { currentDirectoryItem } = useCabinetDirectoriesNav()

const pageTitle = computed(() => currentDirectoryItem.value?.label ?? 'Справочники')

useHead(
  computed(() => ({
    title: pageTitle.value === 'Справочники' ? 'Справочники' : `${pageTitle.value} — Справочники`,
  })),
)
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">{{ pageTitle }}</h2>
    </header>
    <NuxtPage />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/cabinet-page' as cabinet;

.root {
  @include cabinet.cabinet-section-layout;
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--fs-margin-title-content);
  margin: 0;
}

.title {
  @include cabinet.cabinet-section-title;
}
</style>
