<script setup lang="ts">
useHead({
  title: 'Мои пользователи',
})
</script>

<template>
  <section :class="$style.root">
    <h2 :class="$style.title">Мои пользователи</h2>
    <p :class="$style.text">
      Роли: администратор и пользователь с ограничением прав (ТЗ). Список и действия — на этапе интеграции с API.
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
  margin: 0 0 var(--fs-space-2);

  @include typo.fs-text-h3;
}

.text {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}
</style>
