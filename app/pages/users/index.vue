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
