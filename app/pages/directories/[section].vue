<script setup lang="ts">
const route = useRoute()
const { items } = useCabinetDirectoriesNav()

const sectionItem = computed(() =>
  items.find((item) => item.to === `/directories/${String(route.params.section)}`),
)

watch(
  () => route.params.section,
  () => {
    if (!sectionItem.value) {
      void navigateTo('/', { replace: true })
    }
  },
  { immediate: true },
)

const { bannerProps } = useCabinetSectionBanner()

useHead(
  computed(() => ({
    title: sectionItem.value ? `${sectionItem.value.label} — Справочники` : 'Справочники',
  })),
)
</script>

<template>
  <section v-if="sectionItem" :class="$style.root">
    <UiPromoBanner v-if="bannerProps" v-bind="bannerProps" />
  </section>
</template>

<style module lang="scss">
.root {
  width: 100%;
}
</style>
