<script setup lang="ts">
const { isAdmin, roleLabel } = useCabinetRole()
const { logout } = useAuth()

const roleTagText = computed(() => {
  if (roleLabel.value) {
    return roleLabel.value
  }
  return isAdmin.value ? 'Брокер' : 'Пользователь'
})

const { open: footerOpen, toggle: toggleFooter } = useCabinetFooter()

const isLoggingOut = ref(false)

async function onLogout() {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true
  try {
    await logout()
    await navigateTo('/login', { replace: true })
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <header :class="$style.root">
    <div :class="$style.start">
      <button
        type="button"
        :class="$style.menuBtn"
        :aria-expanded="footerOpen"
        aria-controls="cabinet-footer-panel"
        aria-label="Открыть информацию в подвале"
        @click="toggleFooter"
      >
        <span :class="$style.menuIcon" aria-hidden="true">
          <span :class="$style.menuLine" />
          <span :class="$style.menuLine" />
        </span>
      </button>

      <NuxtLink to="/" :class="$style.logoLink" aria-label="ТРЦ Олимпийский — на главную">
        <UIcon name="i-local-logo" :class="$style.logoMark" aria-hidden="true" />
        <UIcon name="i-local-logo-tablet" :class="$style.logoTablet" aria-hidden="true" />
        <UIcon name="i-local-logo-full" :class="$style.logoFull" aria-hidden="true" />
      </NuxtLink>
    </div>

    <div :class="$style.lead">
      <h1 :class="$style.title">Личный кабинет сотрудника</h1>
      <p :class="$style.subtitle">ТРЦ «Олимпийский»</p>
    </div>

    <div :class="$style.actions">
      <span
        :class="[$style.roleTag, isAdmin && $style.roleTagActive]"
      >
        {{ roleTagText }}
      </span>

      <UiButton type="button" variant="primary" size="chrome" disabled title="Позже: профиль">
        Профиль
      </UiButton>
      <UiButton
        type="button"
        variant="auth"
        size="chrome"
        :loading="isLoggingOut"
        @click="onLogout"
      >
        Выйти
      </UiButton>
    </div>
  </header>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--fs-space-2) var(--fs-space-3);
  box-sizing: border-box;
  min-height: var(--fs-cabinet-chrome-height);
  padding-block: rem(19);
  background: transparent;
}

.start {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fs-space-3);
  min-width: 0;
  justify-self: start;
}

.menuBtn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(40);
  height: rem(40);
  margin: 0;
  padding: rem(12);
  border: none;
  border-radius: 50%;
  background: var(--fs-figma-achromatic-black);
  color: var(--fs-figma-achromatic-white);
  cursor: pointer;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

.menuIcon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: rem(4);
  width: rem(16);
  height: rem(16);
}

.menuLine {
  display: block;
  width: rem(10);
  height: rem(2);
  border-radius: rem(2);
  background: currentcolor;
}

.logoLink {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  line-height: 0;
  color: var(--fs-figma-achromatic-black);
  text-decoration: none;

  &:focus-visible {
    border-radius: rem(6);
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

/* Figma Logo: Mobile mark, Tablet 222×22, Desktop full */
.logoMark {
  display: inline-flex;
  width: rem(40);
  height: rem(19);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  @include mq.from-tablet {
    display: none;
  }
}

.logoTablet {
  display: none;
  width: rem(222);
  height: rem(22);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  @include mq.from-tablet {
    display: inline-flex;
  }

  @include mq.from-desktop {
    display: none;
  }
}

.logoFull {
  display: none;
  width: rem(285);
  height: rem(28);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  @include mq.from-desktop {
    display: inline-flex;
  }
}

.lead {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  min-width: 0;
  max-width: 100%;
  text-align: center;
  pointer-events: none;
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
  justify-content: flex-end;
  justify-self: end;
  gap: var(--fs-space-2);
}

/* Figma Desktop/Tags (node 24:267): Default / Active */
.roleTag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: rem(24);
  padding: 0 rem(12) rem(2);
  border-radius: rem(189);
  color: var(--fs-figma-achromatic-black);
  background: var(--fs-color-cabinet-tag-neutral);
  backdrop-filter: blur(20px);
  white-space: nowrap;

  font-family: var(--fs-font-sans);
  font-size: rem(13);
  font-weight: 500;
  line-height: 1.4;
}

.roleTagActive {
  color: var(--fs-figma-achromatic-white);
  background: var(--fs-figma-achromatic-black);
}

@media (max-width: #{bp.$tablet - 1px}) {
  .root {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'start actions'
      'lead lead';
  }

  .start {
    grid-area: start;
  }

  .lead {
    grid-area: lead;
    justify-self: center;
    padding-block-start: var(--fs-space-1);
  }

  .actions {
    grid-area: actions;
  }
}
</style>
