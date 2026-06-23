<script setup lang="ts">
const collapsed = useState('cabinet-sidebar-collapsed', () => false)
const { items, isNavActive } = useCabinetNav()

const collapseTriggerId = 'cabinet-sidebar-collapse-trigger'

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
  <aside :class="[$style.root, { [$style.collapsed]: collapsed }]">
    <div :class="$style.brand">
      <NuxtLink
        to="/"
        :class="[$style.brandLink, { [$style.brandLinkCollapsed]: collapsed }]"
        aria-label="ТРЦ Олимпийский — на главную"
      >
        <UIcon
          :name="collapsed ? 'i-local-logo' : 'i-local-logo-tablet'"
          :class="collapsed ? $style.logoMark : $style.logoFull"
          aria-hidden="true"
        />
      </NuxtLink>
    </div>

    <nav id="cabinet-sidebar-nav" :class="$style.nav" aria-label="Разделы личного кабинета">
      <ul :class="$style.list">
        <li v-for="item in items" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[$style.link, { [$style.active]: isNavActive(item.to) }]"
            :title="collapsed ? item.label : undefined"
            :aria-label="collapsed ? item.label : undefined"
          >
            <UIcon :name="item.icon" :class="$style.linkIcon" aria-hidden="true" />
            <span :class="$style.linkLabel" :aria-hidden="collapsed">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div :class="[$style.toggleHost, { [$style.toggleHostCollapsed]: collapsed }]">
      <div :class="$style.toggleExpandRow">
        <UiButton
          :id="collapseTriggerId"
          v-bind="arrowToggleBind"
          :class="$style.collapseBtn"
          :icon="collapsed ? 'i-arrow-chevron-right' : 'i-arrow-chevron-left'"
          :aria-label="collapsed ? 'Развернуть панель навигации' : 'Свернуть панель навигации'"
          :aria-expanded="!collapsed"
          aria-controls="cabinet-sidebar-nav"
          @click="toggleCollapsed"
        />
        <label
          :class="[$style.toggleCaption, { [$style.toggleCaptionHidden]: collapsed }]"
          :for="collapseTriggerId"
        >
          Свернуть
        </label>
      </div>
    </div>
  </aside>
</template>

<style module lang="scss">
@use 'sass:list';
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

$sidebar-transition-duration: 0.28s;
$sidebar-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

@mixin sidebar-transition($properties...) {
  transition-duration: $sidebar-transition-duration;
  transition-timing-function: $sidebar-transition-easing;

  @if list.length($properties) > 0 {
    transition-property: $properties;
  }
}

.root {
  --sidebar-pad-end: var(--fs-space-2);
  --sidebar-nav-inset: var(--fs-space-3);
  --sidebar-link-pad-inline: var(--fs-space-2);

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: 0 var(--sidebar-pad-end) var(--fs-space-3) 0;
  background: var(--fs-color-cabinet-sidebar-nav);
  color: var(--fs-color-on-cabinet-sidebar-nav);
  width: rem(260);
  overflow-x: hidden;

  @include sidebar-transition(width, padding);
}

.collapsed {
  width: rem(72);
  align-items: stretch;
  --sidebar-pad-end: 0;
  padding-right: 0;
}

.brand {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  box-sizing: border-box;
  width: calc(100% + var(--sidebar-pad-end));
  height: var(--fs-cabinet-chrome-height);
  min-height: var(--fs-cabinet-chrome-height);
  padding-inline: calc(var(--sidebar-nav-inset) + var(--sidebar-link-pad-inline))
    var(--sidebar-nav-inset);
  background: var(--fs-color-cabinet-sidebar);
  border-bottom: 1px solid rgb(255 255 255 / 0.12);

  @include sidebar-transition(width, padding);
}

.brandLink {
  display: flex;
  align-items: center;
  min-width: 0;
  line-height: 0;
  outline: none;
  color: var(--fs-color-on-cabinet-sidebar);
  text-decoration: none;

  &:focus-visible {
    border-radius: rem(6);
    box-shadow: 0 0 0 2px var(--fs-color-on-cabinet-sidebar);
  }
}

/* Figma UI Kit Logo: Mobile 64×30 (mark), Tablet 222×22 (mark + ОЛИМПИЙСКИЙ). */
.logoMark {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(40);
  height: rem(19);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.logoFull {
  display: inline-flex;
  flex-shrink: 1;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  width: rem(222);
  height: rem(22);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.brandLinkCollapsed {
  justify-content: center;
  width: 100%;
}

.collapsed .brand {
  width: 100%;
  margin-inline: 0;
  padding-inline: 0;
  justify-content: center;
}

.nav {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  margin-top: var(--fs-space-3);
  padding-left: var(--sidebar-nav-inset);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-x: none;

  @include sidebar-transition(padding);
}

.collapsed .nav {
  padding-left: 0;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 0;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.link {
  display: flex;
  align-items: center;
  gap: var(--fs-space-2);
  min-width: 0;
  max-width: 100%;
  padding: var(--fs-space-2) var(--sidebar-link-pad-inline);
  border-radius: rem(8);
  color: inherit;
  text-decoration: none;

  @include typo.fs-text-body;
  font-weight: 600;
  @include sidebar-transition(gap, padding, background-color);

  &:hover {
    background: var(--fs-color-cabinet-sidebar-nav-hover);
  }
}

.linkLabel {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 1;
  max-width: rem(200);

  @include sidebar-transition(max-width, opacity, margin, padding);
}

.collapsed .link {
  gap: 0;
  justify-content: center;
  padding: var(--fs-space-2);
}

.collapsed .linkLabel {
  flex: 0 0 auto;
  max-width: 0;
  opacity: 0;
  margin: 0;
  padding: 0;
}

.linkIcon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: rem(24);
  height: rem(24);

  :deep(svg) {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.active {
  background: var(--fs-color-cabinet-sidebar-nav-active);
}

.collapseBtn {
  flex-shrink: 0;
  --ui-btn-arrow-color: var(--fs-color-cabinet-sidebar);
}

.toggleHost {
  display: flex;
  align-items: center;
  margin-top: auto;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  padding-left: var(--sidebar-nav-inset);
  box-sizing: border-box;

  @include sidebar-transition(padding);
}

.collapsed .toggleHost.toggleHostCollapsed {
  justify-content: center;
  padding-inline: 0;
}

.collapsed .toggleHost.toggleHostCollapsed .toggleExpandRow {
  justify-content: center;
  gap: 0;
}

.toggleExpandRow {
  display: flex;
  align-items: center;
  gap: var(--fs-space-2);
  width: 100%;
  min-width: 0;

  @include sidebar-transition(gap);
}

.toggleCaption {
  flex-shrink: 0;
  overflow: hidden;
  color: inherit;
  white-space: nowrap;
  opacity: 1;
  max-width: rem(120);
  cursor: pointer;
  user-select: none;

  @include typo.fs-text-header;
  font-weight: 600;
  @include sidebar-transition(max-width, opacity);

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

@media (prefers-reduced-motion: reduce) {
  .root,
  .brand,
  .nav,
  .link,
  .linkLabel,
  .toggleHost,
  .toggleExpandRow,
  .toggleCaption {
    transition: none;
  }
}
</style>
