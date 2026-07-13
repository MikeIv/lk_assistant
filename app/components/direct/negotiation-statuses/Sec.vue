<script setup lang="ts">
import type { NegotiationStatus } from '#shared/types/negotiationStatuses'

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
  createNegotiationStatus,
  updateNegotiationStatus,
  deleteNegotiationStatus,
} = useNegotiationStatuses()

const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const selectedStatus = ref<NegotiationStatus | null>(null)

function openEdit(item: NegotiationStatus) {
  selectedStatus.value = item
  isEditOpen.value = true
}
</script>

<template>
  <div :class="$style.root">
    <p v-if="error" :class="$style.error">
      {{ error }}
      <button type="button" :class="$style.retry" @click="refresh">Повторить</button>
    </p>

    <DirectNegotiationStatusesTable
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
      @row-click="openEdit"
      @create="isCreateOpen = true"
    />

    <DirectNegotiationStatusesCreateModal
      v-model:open="isCreateOpen"
      :submit-fn="createNegotiationStatus"
    />

    <DirectNegotiationStatusesEditModal
      v-model:open="isEditOpen"
      :negotiation-status="selectedStatus"
      :submit-fn="updateNegotiationStatus"
      :delete-fn="deleteNegotiationStatus"
    />
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
