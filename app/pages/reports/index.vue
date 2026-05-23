<script setup lang="ts">
import { useReportsMock } from '~/composables/reports/useReportsMock'
import type { ReportPeriodFilterValue } from '~/components/reports/ReportsTablePeriodFilter.vue'

const {
  headers,
  reports,
  pagination,
  isLoading,
  sortPeriod,
  selectedStatuses,
  periodRange,
  hasActiveFilters,
  loadPage,
  handlePerPageChange,
  toggleSortOrder,
  applyStatusFilter,
  applyPeriodFilter,
  resetFilters,
} = useReportsMock()

const activePeriodFilter = computed<ReportPeriodFilterValue | null>(() => {
  if (!periodRange.value) {
    return null
  }

  return {
    start: periodRange.value.from,
    end: periodRange.value.to,
  }
})

useHead({
  title: 'Мои отчёты',
})
</script>

<template>
  <section :class="$style.root">
    <header :class="$style.header">
      <h2 :class="$style.title">Мои отчёты</h2>
      <UiButton
        v-if="hasActiveFilters"
        size="sm"
        variant="outline"
        label="Сбросить все фильтры"
        @click="resetFilters"
      />
    </header>

    <ReportsTable
      :headers="headers"
      :reports="reports"
      :pagination="pagination"
      :loading="isLoading"
      :sort-period="sortPeriod"
      :active-status-filters="selectedStatuses"
      :active-period-filter="activePeriodFilter"
      @page-change="loadPage"
      @per-page-change="handlePerPageChange"
      @sort-change="toggleSortOrder"
      @select-status-filter="applyStatusFilter"
      @select-period-filter="applyPeriodFilter"
    />
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/cabinet-page' as cabinet;

.root {
  @include cabinet.cabinet-section-layout;
}

.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2);
  margin: 0;
}

.title {
  @include cabinet.cabinet-section-title;
}
</style>
