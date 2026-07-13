<script setup lang="ts">
const route = useRoute()
const { currentDirectoryItem } = useCabinetDirectoriesNav()
const { bannerProps } = useCabinetSectionBanner()

const section = computed(() => {
  const value = route.params.section
  return typeof value === 'string' ? value : ''
})

const developmentBannerProps = computed(() => {
  if (currentDirectoryItem.value?.hasContent || !bannerProps.value) {
    return undefined
  }

  return bannerProps.value
})

watch(
  () => route.params.section,
  () => {
    if (!currentDirectoryItem.value) {
      void navigateTo('/directories/premises', { replace: true })
    }
  },
  { immediate: true },
)
</script>

<template>
  <section v-if="currentDirectoryItem" :class="$style.root">
    <UiPromoBanner v-if="developmentBannerProps" v-bind="developmentBannerProps" />
    <DirectPremisesSec v-if="section === 'premises'" />
    <DirectRoomTypesSec v-if="section === 'room-types'" />
    <DirectCategoriesSec v-if="section === 'categories'" />
    <DirectLgEntitiesSec v-if="section === 'legal-entities'" />
    <DirectApplicantsSec v-if="section === 'applicants'" />
    <DirectNegotiationStatusesSec v-if="section === 'negotiation-statuses'" />
  </section>
</template>

<style module lang="scss">
.root {
  width: 100%;
}
</style>
