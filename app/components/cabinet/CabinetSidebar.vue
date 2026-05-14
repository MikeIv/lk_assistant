<script setup lang="ts">
const collapsed = useState('cabinet-sidebar-collapsed', () => false)
const { items, isNavActive } = useCabinetNav()

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

    <button
      type="button"
      :class="$style.toggle"
      :aria-expanded="!collapsed"
      aria-controls="cabinet-sidebar-nav"
      @click="toggleCollapsed"
    >
      {{ collapsed ? 'Развернуть' : 'Свернуть' }}
    </button>
  </aside>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: var(--fs-space-3) var(--fs-space-2) var(--fs-space-3) var(--fs-space-3);
  background: var(--fs-color-cabinet-sidebar);
  color: var(--fs-color-on-cabinet-sidebar);
  width: rem(260);
  transition: width 0.2s ease;
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
  font-weight: 700;
  font-size: rem(15);
  letter-spacing: 0.02em;
  white-space: nowrap;
  min-width: 0;
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
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.link {
  display: block;
  padding: var(--fs-space-2) var(--fs-space-2);
  border-radius: rem(8);
  font-weight: 600;
  font-size: rem(14);
  color: inherit;
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

.toggle {
  margin-top: auto;
  align-self: stretch;
  padding: var(--fs-space-2);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: rem(8);
  background: transparent;
  color: inherit;
  font-size: rem(13);
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: var(--fs-color-cabinet-sidebar-hover);
  }
}

.collapsed .toggle {
  font-size: rem(11);
  padding: var(--fs-space-1);
}
</style>
