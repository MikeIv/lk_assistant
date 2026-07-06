<script setup lang="ts">
const {
  items,
  pagination,
  searchQuery,
  sortKey,
  sortDirection,
  perPage,
  error,
  isLoading,
  setPage,
  setPerPage,
  toggleSort,
  refresh,
  createTenantCase,
} = useTenantCases()

const isCreateOpen = ref(false)
</script>

<template>
  <div :class="$style.root">
    <p v-if="error" :class="$style.error">
      {{ error }}
      <button type="button" :class="$style.retry" @click="refresh">Повторить</button>
    </p>

    <BrokerCurrentTable
      :items="items"
      :pagination="pagination"
      :search-query="searchQuery"
      :sort-key="sortKey"
      :sort-direction="sortDirection"
      :per-page="perPage"
      :loading="isLoading"
      @update:search-query="searchQuery = $event"
      @page-change="setPage"
      @per-page-change="setPerPage"
      @sort-change="toggleSort"
      @create="isCreateOpen = true"
    />

    <BrokerCurrentCreateModal v-model:open="isCreateOpen" :submit-fn="createTenantCase" />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: 100%;
  min-width: 0;
}

.error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fs-space-1);
  margin: 0;
  padding: var(--fs-space-2);
  border-radius: rem(12);
  color: #b42318;
  background-color: rgb(180 35 24 / 0.08);

  @include typo.fs-text-body;
}

.retry {
  padding: 0;
  border: none;
  font: inherit;
  color: inherit;
  text-decoration: underline;
  background: transparent;
  cursor: pointer;
}
</style>
