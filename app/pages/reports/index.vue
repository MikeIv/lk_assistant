<script setup lang="ts">
import { useReports } from '~/composables/reports/useReports'
import type { ReportPeriodFilterValue } from '~/components/reports/ReportsTablePeriodFilter.vue'

const {
  headers,
  reports,
  pagination,
  isLoading,
  isRefreshing,
  error,
  isMockMode,
  sortPeriod,
  selectedStatuses,
  periodRange,
  hasActiveFilters,
  init,
  loadPage,
  handlePerPageChange,
  toggleSortOrder,
  applyStatusFilter,
  applyPeriodFilter,
  resetFilters,
} = useReports()

const activePeriodFilter = computed<ReportPeriodFilterValue | null>(() => {
  if (!periodRange.value) {
    return null
  }

  return {
    start: periodRange.value.from,
    end: periodRange.value.to,
  }
})

const isInitialLoading = computed(() => isLoading.value && reports.value.length === 0 && !error.value)

onMounted(async () => {
  await init()
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

    <p v-if="isMockMode" :class="$style.mockHint">
      Данные из mock: укажите `NUXT_PUBLIC_API_BASE` для загрузки с сервера.
    </p>

    <div v-if="isInitialLoading" :class="$style.state">Идёт загрузка…</div>

    <p v-else-if="error" :class="$style.error">{{ error }}</p>

    <ReportsTable
      v-else
      :headers="headers"
      :reports="reports"
      :pagination="pagination"
      :loading="isLoading"
      :is-refreshing="isRefreshing"
      :is-mock-mode="isMockMode"
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
@use '~/assets/styles/tools/functions' as *;

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

.mockHint {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-text-muted);
}

.state,
.error {
  margin: 0;
  padding: var(--fs-space-3);
  border-radius: rem(12);
  text-align: center;
}

.state {
  color: var(--fs-color-text-muted);
  background: var(--fs-color-bg);
}

.error {
  color: var(--fs-color-error);
  background: rgb(238 46 34 / 0.08);
}
</style>
