<template>
  <div :class="$style.layout">
    <main :class="$style.main">
      <slot />
    </main>
  </div>
</template>

<style module lang="scss">
.layout {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 100dvh;
  min-width: 0;
  padding: var(--fs-space-3);
  background-color: var(--fs-figma-achromatic-light-gray);
}

.main {
  width: min(100%, 27.5rem);
  min-width: 0;
}
</style>
