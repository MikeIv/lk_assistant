<script setup lang="ts">
const route = useRoute()
const { currentDirectoryItem } = useCabinetDirectoriesNav()

watch(
  () => route.params.section,
  () => {
    if (!currentDirectoryItem.value) {
      void navigateTo('/directories/premises', { replace: true })
    }
  },
  { immediate: true },
)

const { bannerProps } = useCabinetSectionBanner()
</script>

<template>
  <section v-if="currentDirectoryItem" :class="$style.root">
    <UiPromoBanner v-if="bannerProps" v-bind="bannerProps" />
  </section>
</template>

<style module lang="scss">
.root {
  width: 100%;
}
</style>
