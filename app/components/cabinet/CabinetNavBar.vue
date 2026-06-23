<script setup lang="ts">
const collapsed = useState('cabinet-nav-collapsed', () => false)
const { items, isNavActive } = useCabinetNav()

const arrowToggleBind = {
  type: 'button' as const,
  variant: 'primary' as const,
  size: 'arrow' as const,
  iconSize: 16,
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <nav :class="$style.root" aria-label="Разделы личного кабинета">
    <div :class="$style.navCluster">
      <div :class="$style.menuHost">
        <div
          id="cabinet-nav-segment"
          :class="[$style.shellWrap, { [$style.shellWrapCollapsed]: collapsed }]"
          :aria-hidden="collapsed"
        >
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
      </div>

      <div :class="$style.toggleRow">
        <UiButton
          id="cabinet-nav-collapse-trigger"
          v-bind="arrowToggleBind"
          :icon="collapsed ? 'i-arrow-chevron-left' : 'i-arrow-chevron-right'"
          :aria-label="collapsed ? 'Развернуть меню навигации' : 'Свернуть меню навигации'"
          :aria-expanded="!collapsed"
          aria-controls="cabinet-nav-segment"
          @click="toggleCollapsed"
        />
      </div>
    </div>
  </nav>
</template>

<style module lang="scss">
@use 'sass:list';
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;

$nav-transition-duration: 0.28s;
$nav-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

@mixin nav-transition($properties...) {
  transition-duration: $nav-transition-duration;
  transition-timing-function: $nav-transition-easing;

  @if list.length($properties) > 0 {
    transition-property: $properties;
  }
}

@mixin nav-shell-surface {
  border-radius: rem(25);
  background: var(--fs-color-cabinet-nav-shell);
  backdrop-filter: blur(var(--fs-cabinet-nav-backdrop-blur));
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.root {
  --nav-inline-margin: var(--fs-margin-card);
  --nav-toggle-size: #{rem(36)};
  --nav-toggle-slot: calc(var(--nav-toggle-size) + #{rem(8)});

  position: relative;
  z-index: 5;
  box-sizing: border-box;
  width: 100%;
  padding-block: var(--fs-space-2);
  padding-inline: var(--nav-inline-margin);
  pointer-events: none;

  @include mq.from-tablet {
    --nav-inline-margin: var(--fs-margin-content-block);
  }

  @include mq.from-desktop {
    --nav-inline-margin: var(--fs-margin-menu-footer);
  }
}

.navCluster {
  container-type: inline-size;
  container-name: cabinet-nav;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: rem(84);
  padding-right: var(--nav-toggle-slot);

  @container cabinet-nav (max-width: rem(960)) {
    min-height: rem(128);
    padding-top: calc(var(--nav-toggle-size) + #{rem(12)});
    padding-right: 0;
  }
}

.toggleRow {
  position: absolute;
  top: 50%;
  right: 0;
  z-index: 2;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: rem(4);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(12);
  background: var(--fs-figma-achromatic-white);
  transform: translateY(-50%);
  pointer-events: auto;

  @container cabinet-nav (max-width: rem(960)) {
    top: 0;
    right: 0;
    left: auto;
    transform: none;
  }
}

.toggleRow :global(button) {
  min-width: var(--nav-toggle-size);
  width: var(--nav-toggle-size);
  max-width: var(--nav-toggle-size);
  min-height: var(--nav-toggle-size);
  height: var(--nav-toggle-size);
  border-radius: rem(8);
}

.menuHost {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  pointer-events: auto;
}

.shellWrap {
  box-sizing: border-box;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  padding: var(--fs-space-2);
  @include nav-shell-surface;
  transform: translateX(0);

  @include nav-transition(transform);
}

.shellWrapCollapsed {
  transform: translateX(calc(100% + 100vw));
  pointer-events: none;
}

.segment {
  display: flex;
  flex-wrap: nowrap;
  gap: rem(4);
  width: max-content;
  max-width: 100%;
  min-width: 0;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  border-radius: rem(15);
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shellWrap {
    transition: none;
    backdrop-filter: none;
  }
}
</style>
