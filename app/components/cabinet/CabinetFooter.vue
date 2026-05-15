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
@use '~/assets/styles/tools/typography' as typo;

.root {
  margin-top: auto;
  padding-block: var(--fs-space-2);
  padding-inline: var(--fs-space-3);
  background: var(--fs-color-cabinet-footer-bg);
  border-top: 1px solid var(--fs-color-border);
}

.line {
  margin: 0;
  margin-block-end: var(--fs-margin-min);
  color: var(--fs-color-text);

  @include typo.fs-text-tag;
  font-weight: 600;
}

.muted {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-bot-r;
}
</style>
