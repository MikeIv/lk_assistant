<script setup lang="ts">
import { PASSES_MOCK_ITEMS } from '#shared/constants/passesMock'

useHead({
  title: 'Мои пропуска',
})
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Мои пропуска</h2>
    </header>

    <ul :class="$style.list">
      <li v-for="item in PASSES_MOCK_ITEMS" :key="item.id" :class="$style.item">
        <UiEmployeePassCard
          :photo-src="item.photoSrc"
          :photo-alt="item.photoAlt"
          :first-name="item.firstName"
          :patronymic="item.patronymic"
          :last-name="item.lastName"
          :valid-until="item.validUntil"
          :pass-number="item.passNumber"
        />
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/cabinet-page' as cabinet;
@use '~/assets/styles/tools/functions' as *;
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
  gap: var(--fs-margin-content-block);
  justify-items: center;
  margin: 0;
  padding: var(--fs-margin-content-block);
  border-radius: rem(25);
  background-color: var(--fs-figma-achromatic-white);
  list-style: none;

  @include mq.from-tablet {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-items: stretch;
  }

  @include mq.from-desktop {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.item {
  display: flex;
  justify-content: center;
  min-width: 0;
  width: 100%;

  @include mq.from-tablet {
    justify-content: stretch;
  }
}
</style>
