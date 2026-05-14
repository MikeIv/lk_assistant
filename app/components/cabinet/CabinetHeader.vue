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
      <button type="button" :class="$style.btnGhost" disabled title="Позже: профиль">
        Профиль
      </button>
      <button type="button" :class="$style.btn" disabled title="Позже: выход">
        Выйти
      </button>
    </div>
  </header>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

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
  gap: rem(2);
  min-width: 0;
}

.title {
  margin: 0;
  font-family: var(--fs-font-heading);
  font-size: rem(18);
  font-weight: 700;
  line-height: 1.2;
  color: var(--fs-color-text);
}

.subtitle {
  margin: 0;
  font-size: rem(13);
  font-weight: 500;
  color: var(--fs-color-text-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fs-space-2);
}

.badge {
  padding: rem(4) rem(10);
  border-radius: rem(999);
  font-size: rem(12);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fs-color-on-cabinet-sidebar);
  background: var(--fs-color-cabinet-sidebar);
}

.badgeMuted {
  padding: rem(4) rem(10);
  border-radius: rem(999);
  font-size: rem(12);
  font-weight: 600;
  color: var(--fs-color-text-muted);
  background: var(--fs-color-surface);
  border: 1px solid var(--fs-color-border);
}

.btn,
.btnGhost {
  padding: rem(8) rem(14);
  border-radius: rem(8);
  font-size: rem(13);
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.65;
}

.btn {
  border: none;
  color: #fff;
  background: var(--fs-color-primary);
}

.btnGhost {
  border: 1px solid var(--fs-color-border);
  color: var(--fs-color-text);
  background: #fff;
}
</style>
