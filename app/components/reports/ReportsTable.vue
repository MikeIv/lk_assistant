<script setup lang="ts">
import { FlexRender, useReportsTable } from '~/composables/reports/useReportsTable'
import type { ReportPeriodFilterValue } from '~/components/reports/ReportsTablePeriodFilter.vue'
import type {
  ReportHeader,
  ReportItem,
  ReportPeriodSort,
  ReportStatus,
  ReportsPagination,
} from '#shared/types/reports'

const props = defineProps<{
  headers: ReportHeader[]
  reports: ReportItem[]
  pagination: ReportsPagination
  loading?: boolean
  sortPeriod: ReportPeriodSort
  activeStatusFilters: ReportStatus[]
  activePeriodFilter: ReportPeriodFilterValue | null
}>()

const emit = defineEmits<{
  pageChange: [page: number]
  perPageChange: [value: number | 'all']
  sortChange: [order: ReportPeriodSort]
  selectStatusFilter: [statuses: ReportStatus[]]
  selectPeriodFilter: [range: ReportPeriodFilterValue | null]
  selectionChange: [ids: number[]]
}>()

const cssm = useCssModule()
const tableWrapperRef = ref<HTMLElement | null>(null)

const selectedReports = ref<Set<number>>(new Set())

const showSelectColumn = computed(() => true)

const hasDraftSelection = computed(() => selectedReports.value.size > 0)

function toggleSelect(id: number) {
  if (selectedReports.value.has(id)) {
    selectedReports.value.delete(id)
  } else {
    selectedReports.value.add(id)
  }

  selectedReports.value = new Set(selectedReports.value)
  emit('selectionChange', [...selectedReports.value])
}

const { table } = useReportsTable({
  headers: toRef(props, 'headers'),
  reports: toRef(props, 'reports'),
  selectedReports,
  showSelectColumn,
  onToggleSelect: toggleSelect,
})

const showStatusFilter = ref(false)
const showPeriodFilter = ref(false)
const statusFilterPosition = ref({ top: 0, left: 0 })
const periodFilterPosition = ref({ top: 0, left: 0 })

const statusFilterDraft = ref<ReportStatus[]>([...props.activeStatusFilters])
const periodFilterDraft = ref<ReportPeriodFilterValue | null>(props.activePeriodFilter)

watch(
  () => props.activeStatusFilters,
  (value) => {
    statusFilterDraft.value = [...value]
  },
)

watch(
  () => props.activePeriodFilter,
  (value) => {
    periodFilterDraft.value = value ? { ...value } : null
  },
)

function positionDropdown(event: MouseEvent, offsetLeft: number) {
  const icon = event.currentTarget as HTMLElement
  const container = tableWrapperRef.value

  if (!container) {
    return { top: 0, left: 0 }
  }

  const iconRect = icon.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  return {
    top: iconRect.bottom - containerRect.top + container.scrollTop + 8,
    left: iconRect.left - containerRect.left + container.scrollLeft + offsetLeft,
  }
}

function toggleStatusFilter(event: MouseEvent) {
  showStatusFilter.value = !showStatusFilter.value

  if (showStatusFilter.value) {
    showPeriodFilter.value = false
    statusFilterPosition.value = positionDropdown(event, -120)
  }
}

function togglePeriodFilter(event: MouseEvent) {
  showPeriodFilter.value = !showPeriodFilter.value

  if (showPeriodFilter.value) {
    showStatusFilter.value = false
    periodFilterPosition.value = positionDropdown(event, -140)
  }
}

function applyStatusFilter() {
  emit('selectStatusFilter', [...statusFilterDraft.value])
  showStatusFilter.value = false
}

function applyPeriodFilter() {
  emit('selectPeriodFilter', periodFilterDraft.value ? { ...periodFilterDraft.value } : null)
  showPeriodFilter.value = false
}

function onSortClick() {
  const next: ReportPeriodSort =
    props.sortPeriod === 'desc' ? 'asc' : props.sortPeriod === 'asc' ? 'default' : 'desc'

  emit('sortChange', next)
}

function handlePerPageChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value === 'all' ? 'all' : Number(target.value)
  emit('perPageChange', value)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement

  if (target.closest(`.${cssm.filterButton}`)) {
    return
  }

  if (!target.closest(`.${cssm.filterPanel}`)) {
    showStatusFilter.value = false
    showPeriodFilter.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div :class="$style.root">
    <div ref="tableWrapperRef" :class="$style.tableWrapper">
      <table :class="$style.table">
        <thead :class="$style.thead">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="$style.th"
              :style="header.column.getSize() ? { minWidth: `${header.column.getSize()}px` } : undefined"
            >
              <div :class="$style.headerContent">
                <button
                  v-if="header.column.id === 'period'"
                  type="button"
                  :class="$style.sortButton"
                  aria-label="Сортировка по периоду"
                  @click.stop="onSortClick"
                >
                  <UIcon
                    v-if="sortPeriod === 'default'"
                    name="i-arrow-chevron-sort"
                    :class="$style.sortIcon"
                    aria-hidden="true"
                  />
                  <UIcon
                    v-else-if="sortPeriod === 'desc'"
                    name="i-arrow-chevron-down"
                    :class="$style.sortIcon"
                    aria-hidden="true"
                  />
                  <UIcon
                    v-else
                    name="i-arrow-chevron-down"
                    :class="[$style.sortIcon, $style.sortIconAsc]"
                    aria-hidden="true"
                  />
                </button>

                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />

                <button
                  v-if="header.column.id === 'status'"
                  type="button"
                  :class="[
                    $style.filterButton,
                    { [$style.filterButtonActive]: activeStatusFilters.length > 0 },
                  ]"
                  aria-label="Фильтр по статусу"
                  @click.stop="toggleStatusFilter"
                >
                  <UIcon name="i-local-filter" :class="$style.filterIcon" aria-hidden="true" />
                </button>

                <button
                  v-if="header.column.id === 'period'"
                  type="button"
                  :class="[
                    $style.filterButton,
                    { [$style.filterButtonActive]: Boolean(activePeriodFilter) },
                  ]"
                  aria-label="Фильтр по периоду"
                  @click.stop="togglePeriodFilter"
                >
                  <UIcon name="i-local-filter" :class="$style.filterIcon" aria-hidden="true" />
                </button>
              </div>
            </th>
          </tr>
        </thead>

        <tbody :class="$style.tbody">
          <tr v-if="!reports.length">
            <td :colspan="table.getAllColumns().length" :class="[$style.td, $style.emptyCell]">
              Нет данных для отображения
            </td>
          </tr>

          <tr v-for="row in table.getRowModel().rows" v-else :key="row.id" :class="$style.row">
            <td v-for="cell in row.getVisibleCells()" :key="cell.id" :class="$style.td">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="loading" :class="$style.loadingOverlay" aria-hidden="true">
        <span :class="$style.spinner" />
      </div>

      <ReportsTableStatusFilter
        v-model="statusFilterDraft"
        :class="$style.filterPanel"
        :open="showStatusFilter"
        :style="{
          top: `${statusFilterPosition.top}px`,
          left: `${statusFilterPosition.left}px`,
        }"
        @apply="applyStatusFilter"
      />

      <ReportsTablePeriodFilter
        v-model="periodFilterDraft"
        :class="$style.filterPanel"
        :open="showPeriodFilter"
        :style="{
          top: `${periodFilterPosition.top}px`,
          left: `${periodFilterPosition.left}px`,
        }"
        @apply="applyPeriodFilter"
      />
    </div>

    <footer :class="$style.footer">
      <div :class="$style.perPage">
        <label :class="$style.perPageLabel" for="reports-per-page">Показывать отчёты:</label>
        <select
          id="reports-per-page"
          :class="$style.perPageSelect"
          :value="pagination.perPage >= pagination.total && pagination.total > 0 ? 'all' : String(pagination.perPage)"
          :disabled="pagination.total <= 12"
          @change="handlePerPageChange"
        >
          <option value="12">12</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="all">Все</option>
        </select>
      </div>

      <ReportsTablePagination
        :current-page="pagination.currentPage"
        :last-page="pagination.lastPage"
        @page-change="emit('pageChange', $event)"
      />

      <div :class="$style.total">
        <span :class="$style.totalLabel">Всего отчётов:</span>
        <span :class="$style.totalValue">{{ pagination.total }}</span>
      </div>
    </footer>

    <p v-if="hasDraftSelection" :class="$style.selectionHint">
      Выбрано черновиков: {{ selectedReports.size }}
    </p>
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
  overflow: hidden;
  border-radius: rem(20);
  background-color: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.tableWrapper {
  position: relative;
  overflow: auto;
  width: 100%;
  background-color: var(--fs-color-bg);

  scrollbar-width: thin;
  scrollbar-color: var(--fs-figma-stroke-gray) var(--fs-figma-achromatic-light-gray);
}

.table {
  width: 100%;
  min-width: rem(1100);
  border-collapse: separate;
  border-spacing: 0;

  --reports-table-header-bg: var(--fs-figma-achromatic-middle-gray);
  --reports-table-header-fg: var(--fs-figma-achromatic-white);
  --reports-table-header-divider: rgb(255 255 255 / 0.12);
  --reports-table-header-divider-soft: rgb(255 255 255 / 0.08);
}

.thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--reports-table-header-bg);
}

.th {
  padding: rem(14) rem(12);
  border-bottom: 1px solid var(--reports-table-header-divider);
  border-right: 1px solid var(--reports-table-header-divider-soft);
  font-size: rem(12);
  font-weight: 600;
  line-height: 1.2;
  color: var(--reports-table-header-fg);
  text-align: center;
  white-space: nowrap;
  background-color: var(--reports-table-header-bg);

  &:last-child {
    border-right: none;
  }
}

.headerContent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: rem(6);
}

.sortButton,
.filterButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  color: rgb(255 255 255 / 0.72);
  background: transparent;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--fs-figma-achromatic-white);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
    border-radius: rem(4);
  }
}

.filterButtonActive {
  color: var(--fs-figma-main-building-main);
}

.sortIcon,
.filterIcon {
  width: rem(16);
  height: rem(16);
}

.sortIconAsc {
  transform: rotate(180deg);
}

.tbody {
  background-color: var(--fs-color-bg);
}

.row:nth-child(even) {
  background-color: rgb(244 245 245 / 0.55);
}

.td {
  padding: rem(12) rem(10);
  border-bottom: 1px solid var(--fs-figma-stroke-light-gray);
  border-right: 1px solid var(--fs-figma-stroke-light-gray);
  font-size: rem(13);
  line-height: 1.35;
  color: var(--fs-color-text);
  text-align: center;
  vertical-align: middle;

  &:last-child {
    border-right: none;
  }
}

.emptyCell {
  padding: var(--fs-space-4);
  color: var(--fs-color-text-muted);
}

.loadingOverlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(255 255 255 / 0.55);
}

.spinner {
  width: rem(28);
  height: rem(28);
  border: rem(3) solid var(--fs-figma-stroke-light-gray);
  border-top-color: var(--fs-color-primary);
  border-radius: 50%;
  animation: reports-table-spin 0.8s linear infinite;
}

.filterPanel {
  position: absolute;
}

.footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--fs-space-2);
  align-items: center;
  padding: 0 var(--fs-space-2) var(--fs-space-2);

  @media (min-width: 768px) {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  }
}

.perPage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fs-space-1);
}

.perPageLabel {
  @include typo.fs-text-body;

  color: var(--fs-color-text-muted);
}

.perPageSelect {
  min-width: rem(72);
  padding: rem(6) rem(10);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(8);
  font: inherit;
  color: var(--fs-color-text);
  background-color: var(--fs-color-bg);
}

.total {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: rem(6);
}

.totalLabel {
  @include typo.fs-text-body;

  color: var(--fs-color-text-muted);
}

.totalValue {
  @include typo.fs-text-h5-subtitle;

  color: var(--fs-color-text);
}

.selectionHint {
  margin: 0;
  padding: 0 var(--fs-space-2) var(--fs-space-2);
  font-size: rem(13);
  color: var(--fs-color-text-muted);
}

@keyframes reports-table-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
