<script setup lang="ts"></script>

<template>
  <div :class="$style.layout">
    <div :class="$style.sidebarWrap">
      <CabinetSidebar />
    </div>
    <div :class="$style.headerWrap">
      <CabinetHeader />
    </div>
    <main :class="$style.main">
      <div :class="$style.content">
        <slot />
      </div>
      <CabinetFooter />
    </main>
  </div>
</template>

<style module lang="scss">
.layout {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'sidebar header'
    'sidebar main';
  height: 100dvh;
  min-height: 0;
}

.sidebarWrap {
  grid-area: sidebar;
  min-height: 0;
  overflow: hidden;
}

.headerWrap {
  grid-area: header;
  min-width: 0;
}

.main {
  grid-area: main;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: var(--fs-color-bg);
}

.content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--fs-space-3) var(--fs-space-4);
}
</style>
