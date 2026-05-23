<script setup lang="ts">
const collapsed = useState('cabinet-nav-collapsed', () => false)
const { items, isNavActive } = useCabinetNav()

const collapseTriggerId = 'cabinet-nav-collapse-trigger'

const arrowToggleBind = {
  type: 'button' as const,
  variant: 'primary' as const,
  size: 'arrow' as const,
  iconSize: 20,
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <nav :class="$style.root" aria-label="Разделы личного кабинета">
    <div :class="$style.navCluster">
      <div :class="$style.toggleRow">
        <UiButton
          :id="collapseTriggerId"
          v-bind="arrowToggleBind"
          :icon="collapsed ? 'i-arrow-chevron-right' : 'i-arrow-chevron-left'"
          :aria-label="collapsed ? 'Развернуть меню навигации' : 'Свернуть меню навигации'"
          :aria-expanded="!collapsed"
          aria-controls="cabinet-nav-segment"
          @click="toggleCollapsed"
        />
        <label :class="$style.toggleCaption" :for="collapseTriggerId">
          {{ collapsed ? 'Развернуть меню' : 'Свернуть меню' }}
        </label>
      </div>

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
    </div>
  </nav>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;
@use '~/assets/styles/tools/typography' as typo;

$nav-transition-duration: 0.28s;
$nav-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

@mixin nav-transition($properties...) {
  transition-duration: $nav-transition-duration;
  transition-timing-function: $nav-transition-easing;

  @if length($properties) > 0 {
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
  --nav-toggle-slot: calc(#{rem(116)} + var(--fs-space-2));

  position: fixed;
  z-index: 20;
  right: 0;
  bottom: var(--fs-margin-nav-vertical);
  left: 0;
  box-sizing: border-box;
  width: 100%;
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
  padding-left: var(--nav-toggle-slot);

  @container cabinet-nav (max-width: rem(960)) {
    min-height: rem(156);
    padding-top: rem(72);
    padding-left: 0;
  }
}

.toggleRow {
  position: absolute;
  top: 50%;
  left: 0;
  z-index: 2;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fs-space-1);
  width: max-content;
  max-width: 100%;
  padding: var(--fs-space-2) var(--fs-space-1);
  @include nav-shell-surface;
  transform: translateY(-50%);
  pointer-events: none;

  @container cabinet-nav (max-width: rem(960)) {
    top: 0;
    transform: none;
  }
}

.toggleCaption {
  overflow: hidden;
  color: var(--fs-color-text);
  text-align: center;
  white-space: nowrap;
  opacity: 1;
  cursor: pointer;
  user-select: none;
  pointer-events: auto;

  @include typo.fs-text-tag;
  font-weight: 600;
  line-height: 1.2;

  &:hover {
    text-decoration: underline;
    text-underline-offset: rem(2);
  }
}

.toggleRow :global(button) {
  pointer-events: auto;
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
  transform: translateX(calc(-100% - 100vw));
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
  }

  .toggleRow,
  .shellWrap {
    backdrop-filter: none;
  }
}
</style>
