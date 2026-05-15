<script setup lang="ts">
const { isAdmin } = useCabinetRole()
</script>

<template>
  <header :class="$style.root">
    <div :class="$style.lead">
      <h1 :class="$style.title">Личный кабинет арендатора</h1>
      <p :class="$style.subtitle">ТРЦ «Олимпийский»</p>
    </div>

    <div :class="$style.actions">
      <span v-if="isAdmin" :class="$style.badge">Администратор</span>
      <span v-else :class="$style.badgeMuted">Пользователь</span>
      <UiButton type="button" variant="outline" size="sm" disabled title="Позже: профиль">
        Профиль
      </UiButton>
      <UiButton type="button" variant="accent" size="sm" disabled title="Позже: выход">
        Выйти
      </UiButton>
    </div>
  </header>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2) var(--fs-space-3);
  min-height: rem(56);
  padding: var(--fs-space-2) var(--fs-space-3);
  background: var(--fs-color-cabinet-header-bg);
  border-bottom: 1px solid var(--fs-color-cabinet-header-border);
}

.lead {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  margin: 0;
  margin-block-end: var(--fs-margin-min);
  color: var(--fs-color-text);

  @include typo.fs-text-h4;
  line-height: 1;
}

.subtitle {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-tag;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fs-space-2);
}

.badge {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fs-color-on-cabinet-sidebar);
  background: var(--fs-color-cabinet-sidebar);

  @include typo.fs-text-tag;
  font-weight: 600;
}

.badgeMuted {
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  color: var(--fs-color-text-muted);
  background: var(--fs-color-surface);
  border: 1px solid var(--fs-color-border);

  @include typo.fs-text-tag;
}

</style>
