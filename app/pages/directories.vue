<script setup lang="ts">
useHead({
  title: 'Справочники',
})
</script>

<template>
  <div :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Справочники</h2>
      <CabinetDirectoriesNav />
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
