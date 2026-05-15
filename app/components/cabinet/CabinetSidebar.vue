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
        :class="$style.brandLink"
        aria-label="ТРЦ Олимпийский — на главную"
      >
        <span v-if="!collapsed" :class="$style.brandRow">
          <UIcon name="i-local-logo" :class="$style.logo" aria-hidden="true" />
          <span :class="$style.brandWord">Олимпийский</span>
        </span>
        <UIcon v-else name="i-local-logo" :class="$style.logoMark" aria-hidden="true" />
      </NuxtLink>
    </div>

    <nav id="cabinet-sidebar-nav" :class="$style.nav" aria-label="Разделы личного кабинета">
      <ul :class="$style.list">
        <li v-for="item in items" :key="item.to">
          <NuxtLink
            :to="item.to"
            :class="[$style.link, { [$style.active]: isNavActive(item.to) }]"
            :title="collapsed ? item.label : undefined"
          >
            <span :class="$style.linkLabel">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div :class="[$style.toggleHost, { [$style.toggleHostCollapsed]: collapsed }]">
      <UiButton
        v-if="collapsed"
        v-bind="arrowToggleBind"
        icon="i-arrow-chevron-right"
        aria-label="Развернуть панель навигации"
        :aria-expanded="false"
        aria-controls="cabinet-sidebar-nav"
        @click="toggleCollapsed"
      />
      <div v-else :class="$style.toggleExpandRow">
        <UiButton
          :id="collapseTriggerId"
          v-bind="arrowToggleBind"
          icon="i-arrow-chevron-left"
          :aria-expanded="true"
          aria-controls="cabinet-sidebar-nav"
          @click="toggleCollapsed"
        />
        <label :class="$style.toggleCaption" :for="collapseTriggerId">
          Свернуть
        </label>
      </div>
    </div>
  </aside>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  padding: var(--fs-space-3) var(--fs-space-2) var(--fs-space-3) var(--fs-space-3);
  background: var(--fs-color-cabinet-sidebar);
  color: var(--fs-color-on-cabinet-sidebar);
  width: rem(260);
  transition: width 0.2s ease;
  overflow-x: hidden;
}

.collapsed {
  width: rem(72);
  align-items: center;
  padding-left: var(--fs-space-2);
  padding-right: var(--fs-space-2);
}

.brand {
  margin-bottom: var(--fs-space-4);
  min-height: rem(40);
}

.brandLink {
  display: block;
  line-height: 0;
  outline: none;
  color: var(--fs-color-on-cabinet-sidebar);

  &:focus-visible {
    border-radius: rem(6);
    box-shadow: 0 0 0 2px var(--fs-color-on-cabinet-sidebar);
  }
}

.brandRow {
  display: flex;
  align-items: center;
  gap: var(--fs-space-1);
  line-height: 1.2;
  min-width: 0;
}

.brandWord {
  letter-spacing: 0.02em;
  white-space: nowrap;
  min-width: 0;

  @include typo.fs-text-header;
  font-weight: 600;
}

/* SVG viewBox 64×30 — единый компактный блок (строка бренда и марка в свёрнутом сайдбаре). */
.logo,
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

.logoMark {
  margin: 0 auto;
}

.collapsed .brand {
  margin-bottom: var(--fs-space-3);
}

.collapsed .brandLink {
  display: flex;
  justify-content: center;
  width: 100%;
}

.nav {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-x: none;
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
  display: block;
  min-width: 0;
  max-width: 100%;
  padding: var(--fs-space-2) var(--fs-space-2);
  border-radius: rem(8);
  color: inherit;

  @include typo.fs-text-body;
  font-weight: 600;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--fs-color-cabinet-sidebar-hover);
  }
}

.collapsed .link {
  padding: var(--fs-space-2);
  text-align: center;
}

.collapsed .linkLabel {
  display: none;
}

.active {
  background: var(--fs-color-cabinet-sidebar-active);
}

.toggleHost {
  display: flex;
  align-items: center;
  margin-top: auto;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
}

.toggleHostCollapsed {
  justify-content: center;
}

.toggleExpandRow {
  display: flex;
  align-items: center;
  gap: var(--fs-space-2);
  width: 100%;
  min-width: 0;
}

.toggleCaption {
  flex-shrink: 0;
  color: var(--fs-color-on-cabinet-sidebar);

  @include typo.fs-text-header;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: rem(3);
  }
}
</style>
