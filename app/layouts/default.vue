<script setup lang="ts">
const { open: footerOpen, close: closeFooter } = useCabinetFooter()
</script>

<template>
  <div :class="$style.layout">
    <div :class="$style.chromeSticky">
      <header :class="$style.headerWrap">
        <div :class="$style.shell">
          <CabinetHeader />
        </div>
      </header>

      <div :class="$style.navWrap">
        <CabinetNavBar />
      </div>
    </div>

    <main :class="$style.main">
      <div :class="$style.content">
        <div :class="[$style.shell, $style.siteShell]">
          <slot />
        </div>
      </div>
    </main>

    <Teleport to="body">
      <Transition name="cabinet-footer">
        <div v-if="footerOpen" :class="$style.footerLayer">
          <button
            type="button"
            :class="$style.footerBackdrop"
            aria-label="Закрыть подвал"
            @click="closeFooter"
          />
          <aside
            id="cabinet-footer-panel"
            class="cabinet-footer-panel"
            :class="$style.footerPanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cabinet-footer-title"
          >
            <div :class="$style.shell">
              <div :class="$style.footerPanelHead">
                <h2 id="cabinet-footer-title" :class="$style.footerPanelTitle">О проекте</h2>
                <button
                  type="button"
                  :class="$style.footerClose"
                  aria-label="Закрыть"
                  @click="closeFooter"
                >
                  ×
                </button>
              </div>
              <CabinetFooter />
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style module lang="scss">
@use '../assets/styles/tools/functions' as *;
@use '../assets/styles/tools/cabinet-page' as cabinet;
@use '../assets/styles/variables/z-index' as z;

.layout {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'chrome'
    'main';
  min-height: 100dvh;
  min-width: 0;
  overflow-x: clip;
  overflow-y: auto;
}

.chromeSticky {
  grid-area: chrome;
  position: sticky;
  top: 0;
  z-index: z.z('header');
  overflow: visible;
}

.headerWrap {
  min-width: 0;
  background: var(--fs-color-cabinet-header-glass);
  border-bottom: 1px solid var(--fs-color-cabinet-header-border);
  backdrop-filter: blur(38px);
}

.navWrap {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  z-index: z.z('cabinet-nav-bar');
  min-width: 0;
  pointer-events: none;
}

.shell {
  @include cabinet.cabinet-shell;
  min-width: 0;
}

.siteShell {
  padding-top: var(--fs-space-3);
}

.main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--fs-figma-achromatic-light-gray);
}

.content {
  @include cabinet.cabinet-main-content;
  min-width: 0;
  overflow: visible;
  min-height: auto;
}

.footerLayer {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--fs-space-3) var(--fs-space-3) 0;
  pointer-events: none;
}

.footerBackdrop {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: rgb(23 23 32 / 0.4);
  cursor: pointer;
  pointer-events: auto;
}

.footerPanel {
  position: relative;
  box-sizing: border-box;
  width: min(100%, rem(480));
  max-height: min(70dvh, rem(360));
  overflow: auto;
  border-radius: rem(16) rem(16) 0 0;
  background: var(--fs-color-bg);
  box-shadow: 0 rem(-4) rem(24) rgb(23 23 32 / 0.12);
  pointer-events: auto;

  .shell {
    padding-block-end: var(--fs-space-3);
  }
}

.footerPanelHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2);
  padding-block: var(--fs-space-3) 0;
}

.footerPanelTitle {
  margin: 0;
  font-family: var(--fs-font-heading);
  font-size: rem(18);
  font-weight: 600;
  line-height: 1.15;
  color: var(--fs-color-text);
}

.footerClose {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: rem(36);
  height: rem(36);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--fs-figma-system-gray);
  color: var(--fs-color-text);
  font-size: rem(24);
  line-height: 1;
  cursor: pointer;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}
</style>

<style lang="scss">
.cabinet-footer-enter-active,
.cabinet-footer-leave-active {
  transition: opacity 0.2s ease;

  .cabinet-footer-panel {
    transition: transform 0.24s ease;
  }
}

.cabinet-footer-enter-from,
.cabinet-footer-leave-to {
  opacity: 0;

  .cabinet-footer-panel {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cabinet-footer-enter-active,
  .cabinet-footer-leave-active {
    transition: none;

    .cabinet-footer-panel {
      transition: none;
    }
  }

  .cabinet-footer-enter-from,
  .cabinet-footer-leave-to {
    .cabinet-footer-panel {
      transform: none;
    }
  }
}
</style>
