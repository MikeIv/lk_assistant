<script setup lang="ts">
useHead({
  title: 'На главную',
})
</script>

<template>
  <section :class="$style.root">
    <h2 :class="$style.title">На главную</h2>
    <p :class="$style.text">
      Раздел под новости и обзорную информацию — наполнение по согласованию (ТЗ).
    </p>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  max-width: rem(720);
}

.title {
  margin: 0;
  margin-block-end: var(--fs-margin-title-content);

  @include typo.fs-text-h3;
}

.text {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}
</style>
