<script setup lang="ts">
const { items, isNavActive } = useCabinetNav()
</script>

<template>
  <nav :class="$style.root" aria-label="Разделы личного кабинета">
    <div :class="$style.shell">
      <div :class="$style.segment">
        <UiNavButton
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :label="item.label"
          :accent="item.accent"
          :home="item.home"
          :active="isNavActive(item.to)"
        />
      </div>
    </div>
  </nav>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;

.root {
  position: fixed;
  z-index: 20;
  bottom: var(--fs-margin-nav-vertical);
  left: 50%;
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - 2 * var(--fs-margin-card));
  transform: translateX(-50%);
  pointer-events: none;
}

.shell {
  box-sizing: border-box;
  max-width: 100%;
  padding: var(--fs-space-2);
  border-radius: rem(25);
  background: var(--fs-color-cabinet-nav-shell);
  backdrop-filter: blur(var(--fs-cabinet-nav-backdrop-blur));
  box-shadow: var(--fs-shadow-cabinet-nav);
  pointer-events: auto;
}

.segment {
  display: flex;
  gap: rem(4);
  max-width: 100%;
  padding: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  border-radius: rem(15);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

@include mq.from-tablet {
  .segment {
    flex-wrap: wrap;
    justify-content: center;
    overflow-x: visible;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shell {
    backdrop-filter: none;
  }
}
</style>
