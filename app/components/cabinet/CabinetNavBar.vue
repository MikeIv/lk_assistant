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
    <div :class="[$style.toggleRow, { [$style.toggleRowCollapsed]: collapsed }]">
      <UiButton
        :id="collapseTriggerId"
        v-bind="arrowToggleBind"
        :icon="collapsed ? 'i-arrow-chevron-right' : 'i-arrow-chevron-left'"
        :aria-label="collapsed ? 'Развернуть меню навигации' : 'Свернуть меню навигации'"
        :aria-expanded="!collapsed"
        aria-controls="cabinet-nav-segment"
        @click="toggleCollapsed"
      />
      <label
        :class="[$style.toggleCaption, { [$style.toggleCaptionHidden]: collapsed }]"
        :for="collapseTriggerId"
      >
        Свернуть
      </label>
    </div>

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

.root {
  --nav-inline-margin: var(--fs-margin-card);

  position: fixed;
  z-index: 20;
  bottom: var(--fs-margin-nav-vertical);
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: rem(84);
  pointer-events: none;

  @include mq.from-tablet {
    --nav-inline-margin: var(--fs-margin-content-block);
  }

  @include mq.from-desktop {
    --nav-inline-margin: var(--fs-margin-menu-footer);
  }
}

.toggleRow {
  position: absolute;
  top: 50%;
  left: var(--nav-inline-margin);
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--fs-space-2);
  transform: translateY(-50%);
  pointer-events: auto;

  @include nav-transition(gap);
}

.toggleRowCollapsed {
  gap: 0;
}

.toggleCaption {
  flex-shrink: 0;
  overflow: hidden;
  color: var(--fs-color-text);
  white-space: nowrap;
  opacity: 1;
  max-width: rem(120);
  cursor: pointer;
  user-select: none;

  @include typo.fs-text-header;
  font-weight: 600;
  @include nav-transition(max-width, opacity);

  &:hover {
    text-decoration: underline;
    text-underline-offset: rem(3);
  }
}

.toggleCaptionHidden {
  flex: 0 0 0;
  max-width: 0;
  opacity: 0;
  pointer-events: none;
}

.shellWrap {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  width: max-content;
  max-width: calc(100% - 2 * var(--nav-inline-margin));
  padding: var(--fs-space-2);
  border-radius: rem(25);
  background: var(--fs-color-cabinet-nav-shell);
  backdrop-filter: blur(var(--fs-cabinet-nav-backdrop-blur));
  box-shadow: var(--fs-shadow-cabinet-nav);
  transform: translate(-50%, -50%);
  pointer-events: auto;

  @include nav-transition(transform);
}

.shellWrapCollapsed {
  transform: translate(calc(-50% - 100vw), -50%);
  pointer-events: none;
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
  .toggleRow,
  .toggleCaption,
  .shellWrap {
    transition: none;
  }

  .shellWrap {
    backdrop-filter: none;
  }
}
</style>
