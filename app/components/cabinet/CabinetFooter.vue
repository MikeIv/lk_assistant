<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer :class="$style.root">
    <p :class="$style.line">
      © {{ year }} ТРЦ «Олимпийский». Личный кабинет арендатора.
    </p>
    <p :class="$style.muted">Техподдержка и реквизиты — по согласованию.</p>
  </footer>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  margin-top: auto;
  padding: var(--fs-space-3) var(--fs-space-3);
  background: var(--fs-color-cabinet-footer-bg);
  border-top: 1px solid var(--fs-color-border);
}

.line {
  margin: 0 0 rem(4);
  font-size: rem(13);
  font-weight: 600;
  color: var(--fs-color-text);
}

.muted {
  margin: 0;
  font-size: rem(12);
  color: var(--fs-color-text-muted);
}
</style>
