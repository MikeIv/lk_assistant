<script setup lang="ts">
import { SECTION_UNDER_DEVELOPMENT_BANNER } from '#shared/constants/sectionUnderDevelopment'

useHead({
  title: 'Новости',
})
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Новости</h2>
    </header>

    <UiPromoBanner v-bind="SECTION_UNDER_DEVELOPMENT_BANNER" preset="events" />
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/cabinet-page' as cabinet;

.root {
  @include cabinet.cabinet-section-layout;
}

.header {
  margin: 0;
}

.title {
  @include cabinet.cabinet-section-title;
}
</style>
