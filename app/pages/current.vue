<script setup lang="ts">
const title = 'Текущие дела'

useHead({ title })
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">{{ title }}</h2>
    </header>
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
