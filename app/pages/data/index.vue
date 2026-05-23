<script setup lang="ts">
const { activeTab, data, isMockMode, apiNotice } = useTenantData()

useHead({
  title: 'Мои данные',
})
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Мои данные</h2>
    </header>

    <p v-if="isMockMode" :class="$style.hint">
      Данные из mock: укажите `NUXT_PUBLIC_API_BASE` для загрузки с сервера (после согласования контракта).
    </p>

    <p v-else-if="apiNotice" :class="$style.hint">{{ apiNotice }}</p>

    <DataSectionTabs v-model="activeTab" />

    <div :class="$style.content" role="tabpanel">
      <DataGeneralSection v-if="activeTab === 'general'" v-model="data.general" />
      <DataAssortmentSection v-else v-model="data.assortment" />
    </div>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/cabinet-page' as cabinet;
@use '~/assets/styles/tools/functions' as *;

.root {
  @include cabinet.cabinet-section-layout;
}

.header {
  margin: 0;
}

.title {
  @include cabinet.cabinet-section-title;
}

.hint {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-text-muted);
}

.content {
  width: 100%;
}
</style>
