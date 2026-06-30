<script setup lang="ts">
const route = useRoute()
const { currentTenantItem } = useCabinetTenantsNav()

watch(
  () => route.params.section,
  () => {
    if (!currentTenantItem.value) {
      void navigateTo('/tenants/registry', { replace: true })
    }
  },
  { immediate: true },
)

const { bannerProps } = useCabinetSectionBanner()
</script>

<template>
  <section v-if="currentTenantItem" :class="$style.root">
    <UiPromoBanner v-if="bannerProps" v-bind="bannerProps" />
  </section>
</template>

<style module lang="scss">
.root {
  width: 100%;
}
</style>
