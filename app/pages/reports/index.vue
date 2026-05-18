<script setup lang="ts">
useHead({
  title: 'Мои отчёты',
})
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Мои отчёты</h2>
      <p :class="$style.hint">
        Кнопка «Создать отчёт» будет в правом верхнем углу этой вкладки вместо старой «Сформировать отчёт» (ТЗ).
      </p>
    </header>
    <p :class="$style.text">
      Здесь будет таблица отчётов со статусами, фильтрами и пагинацией — перенос из Щёлковского ЛК.
    </p>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  width: 100%;
}

.header {
  display: flex;
  flex-direction: column;
  margin-block-end: var(--fs-margin-title-content);
}

.title {
  margin: 0;
  margin-block-end: var(--fs-margin-title-subtitle-block);

  @include typo.fs-text-h3;
}

.hint {
  margin: 0;
  color: var(--fs-color-text-muted);
  max-width: rem(520);

  @include typo.fs-text-tag;
}

.text {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}
</style>
