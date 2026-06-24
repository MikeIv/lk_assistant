<script setup lang="ts">
const route = useRoute()
const { currentBrokerItem } = useCabinetBrokerNav()

watch(
  () => route.params.section,
  () => {
    if (!currentBrokerItem.value) {
      void navigateTo('/broker/calendar', { replace: true })
    }
  },
  { immediate: true },
)

const { bannerProps } = useCabinetSectionBanner()
</script>

<template>
  <section v-if="currentBrokerItem" :class="$style.root">
    <UiPromoBanner v-if="bannerProps" v-bind="bannerProps" />
  </section>
</template>

<style module lang="scss">
.root {
  width: 100%;
}
</style>
