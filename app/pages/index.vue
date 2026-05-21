<script setup lang="ts">
import { NEWS_MOCK_ITEMS } from '#shared/constants/newsMock'

useHead({
  title: 'Новости',
})
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Новости</h2>
    </header>

    <ul :class="$style.list">
      <li v-for="item in NEWS_MOCK_ITEMS" :key="item.id" :class="$style.item">
        <UiNewsCard
          :title="item.title"
          :excerpt="item.excerpt"
          :image-src="item.imageSrc"
          :image-alt="item.imageAlt"
          :tags="item.tags"
          :to="item.to"
        />
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/cabinet-page' as cabinet;
@use '~/assets/styles/tools/mixins' as mq;

.root {
  @include cabinet.cabinet-section-layout;
}

.header {
  margin: 0;
}

.title {
  @include cabinet.cabinet-section-title;
}

.list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--fs-margin-card-sm);
  margin: 0;
  padding: 0;
  list-style: none;

  @include mq.from-tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--fs-margin-content-block);
  }

  @include mq.from-desktop {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.item {
  min-width: 0;
}
</style>
