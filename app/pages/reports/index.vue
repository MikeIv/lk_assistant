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

.root {
  max-width: rem(960);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  margin-bottom: var(--fs-space-3);
}

.title {
  margin: 0;
  font-size: rem(22);
  font-weight: 700;
}

.hint {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-text-muted);
  max-width: rem(520);
}

.text {
  margin: 0;
  font-size: rem(15);
  line-height: 1.5;
  color: var(--fs-color-text-muted);
}
</style>
