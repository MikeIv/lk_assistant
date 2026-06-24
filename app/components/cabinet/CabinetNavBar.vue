<script setup lang="ts">
import type { CabinetNavItem } from '~/composables/useCabinetNav'

const collapsed = useState('cabinet-nav-collapsed', () => false)
const expandedNavKey = useState<string | null>('cabinet-nav-submenu-key', () => null)

const route = useRoute()
const { items, isTopNavItemActive } = useCabinetNav()
const { isDirectoryNavActive } = useCabinetDirectoriesNav()

const arrowToggleBind = {
  type: 'button' as const,
  variant: 'primary' as const,
  size: 'arrow' as const,
  iconSize: 16,
}

const expandedNavItem = computed(() =>
  items.find((item) => item.to === expandedNavKey.value && item.children?.length),
)

const triggerEl = ref<HTMLElement | null>(null)
const shellWrapEl = ref<HTMLElement | null>(null)
const flyoutEl = ref<HTMLElement | null>(null)
const triggerWidth = ref(0)
const flyoutOffset = ref({ left: 0, top: 0 })

let triggerResizeObserver: ResizeObserver | null = null

const submenuStyle = computed(() => {
  const accent = expandedNavItem.value?.accent
  if (!accent) {
    return undefined
  }

  return {
    '--nav-submenu-accent': accent,
    '--nav-submenu-bridge-bg': 'var(--fs-color-cabinet-nav-shell)',
    '--nav-submenu-corner-radius': '16px',
    '--nav-trigger-width': triggerWidth.value ? `${triggerWidth.value}px` : undefined,
    '--nav-flyout-left': `${flyoutOffset.value.left}px`,
    '--nav-flyout-top': `${flyoutOffset.value.top}px`,
  }
})

function updateLayoutMetrics() {
  const anchor = triggerEl.value
  const shell = shellWrapEl.value
  const flyout = flyoutEl.value

  if (!anchor || !shell) {
    triggerWidth.value = 0
    return
  }

  triggerWidth.value = anchor.offsetWidth

  const anchorRect = anchor.getBoundingClientRect()
  const shellRect = shell.getBoundingClientRect()
  const flyoutWidth = flyout?.offsetWidth ?? 0
  const anchorCenterX = anchorRect.left - shellRect.left + anchorRect.width / 2

  flyoutOffset.value = {
    left: anchorCenterX - flyoutWidth / 2,
    top: anchorRect.bottom - shellRect.top,
  }
}

function bindTriggerRef(el: Element | ComponentPublicInstance | null) {
  triggerResizeObserver?.disconnect()
  triggerResizeObserver = null

  const node = el instanceof HTMLElement ? el : null
  triggerEl.value = node

  if (!node) {
    triggerWidth.value = 0
    return
  }

  updateLayoutMetrics()

  if (typeof ResizeObserver === 'undefined') {
    return
  }

  triggerResizeObserver = new ResizeObserver(() => {
    updateLayoutMetrics()
  })
  triggerResizeObserver.observe(node)
}

function hasChildren(item: CabinetNavItem): boolean {
  return Boolean(item.children?.length)
}

function isSubmenuExpanded(item: CabinetNavItem): boolean {
  return expandedNavKey.value === item.to
}

function toggleSubmenu(item: CabinetNavItem) {
  expandedNavKey.value = isSubmenuExpanded(item) ? null : item.to
}

function selectTopNavItem(_item: CabinetNavItem) {
  expandedNavKey.value = null
}

function toggleCollapsed() {
  if (!collapsed.value) {
    expandedNavKey.value = null
  }
  collapsed.value = !collapsed.value
}

watch(
  () => route.path,
  (path) => {
    if (path === '/directories' || path.startsWith('/directories/')) {
      expandedNavKey.value = '/directories'
      return
    }

    if (expandedNavKey.value === '/directories') {
      expandedNavKey.value = null
    }
  },
  { immediate: true },
)

watch(expandedNavKey, async () => {
  await nextTick()
  updateLayoutMetrics()
})

onMounted(() => {
  updateLayoutMetrics()
  window.addEventListener('resize', updateLayoutMetrics, { passive: true })
})

onUnmounted(() => {
  triggerResizeObserver?.disconnect()
  triggerResizeObserver = null
  window.removeEventListener('resize', updateLayoutMetrics)
})
</script>

<template>
  <nav :class="$style.root" aria-label="Разделы личного кабинета">
    <div :class="$style.navCluster">
      <div :class="$style.menuHost">
        <div
          id="cabinet-nav-segment"
          ref="shellWrapEl"
          :class="[$style.shellWrap, { [$style.shellWrapCollapsed]: collapsed }]"
          :aria-hidden="collapsed"
        >
          <div :class="$style.segment">
            <template v-for="item in items" :key="item.to">
              <div
                v-if="hasChildren(item)"
                :ref="bindTriggerRef"
                :class="$style.navItemAnchor"
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
              v-if="expandedNavItem"
              id="cabinet-nav-submenu"
              ref="flyoutEl"
              :class="$style.submenuFlyout"
              :style="submenuStyle"
            >
              <div :class="$style.submenuBridge" aria-hidden="true" />
              <div :class="$style.submenuJunction" aria-hidden="true">
                <span :class="$style.submenuJunctionCurveLeft" />
                <span :class="$style.submenuJunctionCurveRight" />
              </div>
              <div :class="$style.submenu">
                <NuxtLink
                  v-for="child in expandedNavItem.children"
                  :key="child.to"
                  :to="child.to"
                  :class="[
                    $style.submenuLink,
                    { [$style.submenuLinkActive]: isDirectoryNavActive(child.to) },
                  ]"
                  :aria-current="isDirectoryNavActive(child.to) ? 'page' : undefined"
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

  &::-webkit-scrollbar {
    display: none;
  }
}

.navItemAnchor {
  display: inline-flex;
  flex-shrink: 0;
  align-items: stretch;
}

.submenuFlyout {
  position: absolute;
  top: var(--nav-flyout-top, 0);
  left: var(--nav-flyout-left, 0);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: max-content;
  max-width: min(100vw, rem(640));
  margin-top: 0;
  padding-top: rem(11);
  pointer-events: auto;
}

.submenuBridge {
  position: absolute;
  top: 0;
  left: 50%;
  width: var(--nav-trigger-width, 100%);
  height: rem(11);
  transform: translateX(-50%);
  background: var(--nav-submenu-accent);
  pointer-events: none;
}

.submenuJunction {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 100%;
  height: 0;
  pointer-events: none;
}

@mixin submenu-junction-curve($circle-position) {
  width: var(--nav-submenu-corner-radius, #{rem(16)});
  height: var(--nav-submenu-corner-radius, #{rem(16)});
  background: radial-gradient(
    circle at $circle-position,
    var(--nav-submenu-bridge-bg) calc(var(--nav-submenu-corner-radius, #{rem(16)}) - #{rem(0.5)}),
    var(--nav-submenu-accent) var(--nav-submenu-corner-radius, #{rem(16)})
  );
}

.submenuJunctionCurveLeft,
.submenuJunctionCurveRight {
  position: absolute;
  top: rem(-16);
}

.submenuJunctionCurveLeft {
  left: calc(50% - var(--nav-trigger-width, 100%) / 2 - var(--nav-submenu-corner-radius, #{rem(16)}));
  transform-origin: 100% 100%;
  transform: translateY(calc(-1 * var(--nav-submenu-corner-radius, #{rem(16)}))) rotate(-90deg);
  @include submenu-junction-curve(100% 0);
}

.submenuJunctionCurveRight {
  right: calc(50% - var(--nav-trigger-width, 100%) / 2 - var(--nav-submenu-corner-radius, #{rem(16)}));
  transform-origin: 0 100%;
  transform: translateY(calc(-1 * var(--nav-submenu-corner-radius, #{rem(16)}))) rotate(90deg);
  @include submenu-junction-curve(0 0);
}

.submenu {
  position: relative;
  z-index: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: rem(8);
  width: max-content;
  min-width: rem(200);
  margin-top: rem(-1);
  padding: rem(10) rem(16) rem(14);
  border-radius: rem(16);
  background: var(--nav-submenu-accent);
  backdrop-filter: blur(20px);
  box-shadow: var(--fs-shadow-cabinet-nav);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
  scrollbar-width: none;

  --nav-submenu-link-hover-bg: rgb(255 255 255 / 0.14);
  --nav-submenu-link-active-bg: rgb(255 255 255 / 0.3);
  --nav-submenu-link-active-hover-bg: rgb(255 255 255 / 0.38);

  &::-webkit-scrollbar {
    display: none;
  }
}

.submenuLink {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: rem(6) rem(12);
  border-radius: rem(10);
  font-family: var(--fs-font-sans);
  font-size: rem(13);
  font-weight: 500;
  line-height: 1.4;
  color: var(--fs-figma-achromatic-white);
  text-decoration: none;
  white-space: nowrap;
  background: transparent;
  box-shadow: none;

  @include nav-transition(background-color, color, box-shadow, transform);

  &:hover:not(.submenuLinkActive) {
    background: var(--nav-submenu-link-hover-bg);
  }

  &:active:not(.submenuLinkActive) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: rem(2) solid var(--fs-figma-achromatic-white);
    outline-offset: rem(2);
  }
}

.submenuLinkActive {
  font-weight: 600;
  background: var(--nav-submenu-link-active-bg);
  box-shadow: 0 rem(1) rem(6) rgb(0 0 0 / 0.1);

  &:hover {
    background: var(--nav-submenu-link-active-hover-bg);
  }

  &:active {
    transform: scale(0.99);
  }
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
