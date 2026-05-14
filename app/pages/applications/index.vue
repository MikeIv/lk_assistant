<script setup lang="ts">
useHead({
  title: 'Мои заявки',
})
</script>

<template>
  <section :class="$style.root">
    <h2 :class="$style.title">Мои заявки</h2>
    <p :class="$style.text">
      Раздел создан по ТЗ; наполнение согласуется отдельно.
    </p>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  max-width: rem(720);
}

.title {
  margin: 0 0 var(--fs-space-2);
  font-size: rem(22);
  font-weight: 700;
}

.text {
  margin: 0;
  font-size: rem(15);
  line-height: 1.5;
  color: var(--fs-color-text-muted);
}
</style>
