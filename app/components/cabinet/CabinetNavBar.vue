<script setup lang="ts">
import type { CabinetNavItem } from '~/composables/useCabinetNav'

const collapsed = useState('cabinet-nav-collapsed', () => false)

const route = useRoute()
const { items, isTopNavItemActive, isNavActive } = useCabinetNav()
const {
  expandedNavKey,
  expandedNavItem,
  submenuReady,
  submenuStyle,
  shellWrapEl,
  flyoutEl,
  bindTriggerRef,
  isSubmenuExpanded,
  toggleSubmenu,
  closeSubmenu,
  syncExpandedNavFromRoute,
  updateLayoutMetrics,
} = useCabinetNavSubmenuLayout(items)

const arrowToggleBind = {
  type: 'button' as const,
  variant: 'primary' as const,
  size: 'arrow' as const,
  iconSize: 16,
}

function hasChildren(item: CabinetNavItem): boolean {
  return Boolean(item.children?.length)
}

function selectTopNavItem(_item: CabinetNavItem) {
  closeSubmenu()
}

function isChildNavActive(to: string): boolean {
  return isNavActive(to)
}

function toggleCollapsed() {
  if (!collapsed.value) {
    closeSubmenu()
  }
  collapsed.value = !collapsed.value
}

watch(
  () => route.path,
  (path) => {
    syncExpandedNavFromRoute(path)
  },
  { immediate: true },
)
</script>

<template>
  <nav :class="$style.root" aria-label="Разделы личного кабинета">
    <div :class="$style.navCluster">
      <div :class="$style.menuHost">
        <div
          id="cabinet-nav-segment"
          ref="shellWrapEl"
          :class="[$style.shellWrap, { [$style.shellWrapCollapsed]: collapsed }]"
          :style="submenuReady ? submenuStyle : undefined"
          :aria-hidden="collapsed"
        >
          <div :class="$style.segment">
            <template v-for="item in items" :key="item.to">
              <div
                v-if="hasChildren(item)"
                :ref="expandedNavKey === item.to ? bindTriggerRef : undefined"
                :class="[
                  $style.navItemAnchor,
                  { [$style.navItemAnchorExpanded]: isSubmenuExpanded(item) },
                ]"
              >
                <UiNavButton
                  :label="item.label"
                  :accent="item.accent"
                  :active="isTopNavItemActive(item)"
                  :submenu-open="isSubmenuExpanded(item)"
                  :aria-expanded="isSubmenuExpanded(item)"
                  aria-controls="cabinet-nav-submenu"
                  @click="toggleSubmenu(item)"
                />
              </div>

              <UiNavButton
                v-else
                :to="item.to"
                :label="item.label"
                :accent="item.accent"
                :home="item.home"
                :active="isTopNavItemActive(item)"
                @click="selectTopNavItem(item)"
              />
            </template>
          </div>

          <Transition name="cabinet-nav-submenu" @after-enter="updateLayoutMetrics">
            <div
              v-if="submenuReady && expandedNavItem"
              id="cabinet-nav-submenu"
              ref="flyoutEl"
              :class="$style.submenuFlyout"
            >
              <div :class="$style.submenuBridge" aria-hidden="true" />
              <div :class="$style.submenuJunction" aria-hidden="true">
                <span :class="$style.junctionCurveStart" />
                <span :class="$style.junctionCurveEnd" />
              </div>
              <div :class="$style.submenu">
                <NuxtLink
                  v-for="child in expandedNavItem.children"
                  :key="child.to"
                  :to="child.to"
                  :class="[
                    $style.submenuLink,
                    { [$style.submenuLinkActive]: isChildNavActive(child.to) },
                  ]"
                  :aria-current="isChildNavActive(child.to) ? 'page' : undefined"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </Transition>
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
@use '~/assets/styles/tools/cabinet-nav-submenu' as nav-submenu;
@use '~/assets/styles/variables/z-index' as z;

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
  z-index: z.z('cabinet-nav-bar');
  box-sizing: border-box;
  width: 100%;
  padding-block: var(--fs-space-1);
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
  overflow-x: clip;

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
  z-index: z.z('cabinet-nav-toggle');
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
  pointer-events: auto;
}

.shellWrap {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  padding: var(--fs-space-1);
  overflow: visible;
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
  align-items: stretch;
  gap: rem(4);
  width: max-content;
  max-width: 100%;
  min-width: 0;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: none;

  & > * {
    position: relative;
    z-index: z.z('cabinet-nav-segment-item');
  }

  &::-webkit-scrollbar {
    display: none;
  }
}

.navItemAnchor {
  display: inline-flex;
  flex-shrink: 0;
  align-items: stretch;
}

.segment > .navItemAnchorExpanded {
  z-index: z.z('cabinet-nav-active-trigger');
}

.submenuFlyout {
  @include nav-submenu.flyout;
}

.submenuBridge {
  @include nav-submenu.bridge;
}

.submenuJunction {
  @include nav-submenu.junction-host;
}

.junctionCurveStart {
  @include nav-submenu.junction-curve-start;
}

.junctionCurveEnd {
  @include nav-submenu.junction-curve-end;
}

.submenu {
  @include nav-submenu.panel;
}

.submenuLink {
  @include nav-submenu.link;

  @include nav-transition(background-color, color, box-shadow, transform);
}

.submenuLinkActive {
  @include nav-submenu.link-active;
}

@media (prefers-reduced-motion: reduce) {
  .shellWrap {
    transition: none;
    backdrop-filter: none;
  }

  .submenu {
    backdrop-filter: none;
  }

  .submenuLink {
    transition: none;

    &:active,
    &.submenuLinkActive:active {
      transform: none;
    }
  }
}
</style>

<style lang="scss">
@use '~/assets/styles/tools/functions' as *;

.cabinet-nav-submenu-enter-active,
.cabinet-nav-submenu-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.cabinet-nav-submenu-enter-from,
.cabinet-nav-submenu-leave-to {
  opacity: 0;
  transform: translateY(rem(-6));
}

@media (prefers-reduced-motion: reduce) {
  .cabinet-nav-submenu-enter-active,
  .cabinet-nav-submenu-leave-active {
    transition: none;
  }

  .cabinet-nav-submenu-enter-from,
  .cabinet-nav-submenu-leave-to {
    transform: none;
  }
}
</style>
