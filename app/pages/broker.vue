<script setup lang="ts">
import { useCabinetBrokerNav } from '~/composables/useCabinetBrokerNav'
const { currentBrokerItem } = useCabinetBrokerNav()

const pageTitle = computed(() => currentBrokerItem.value?.label ?? 'Брокер')

useHead(
  computed(() => ({
    title: pageTitle.value === 'Брокер' ? 'Брокер' : `${pageTitle.value} — Брокер`,
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
