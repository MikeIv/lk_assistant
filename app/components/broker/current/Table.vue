<script setup lang="ts">
import type {
  TenantCase,
  TenantCaseSortDirection,
  TenantCaseSortKey,
  TenantCaseTableRow,
  TenantCasesPagination,
} from '#shared/types/tenantCases'
import {
  flattenTenantCasesForTable,
  formatTenantCaseArea,
} from '#shared/utils/tenantCasesNormalize'
import { TENANT_CASES_PER_PAGE_OPTIONS } from '#shared/utils/tenantCasesTable'

const props = defineProps<{
  items: TenantCase[]
  pagination: TenantCasesPagination
  searchQuery: string
  sortKey: TenantCaseSortKey
  sortDirection: TenantCaseSortDirection
  perPage: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  pageChange: [page: number]
  perPageChange: [value: number]
  sortChange: [key: TenantCaseSortKey]
  create: []
}>()

const cssm = useCssModule()

const columns: Array<{
  field: keyof TenantCaseTableRow
  sortKey?: TenantCaseSortKey
  label: string
  align: 'start' | 'center'
  merged?: boolean
  multiline?: boolean
}> = [
  { field: 'number', sortKey: 'number', label: '№', align: 'center', merged: true },
  { field: 'floor', sortKey: 'floor', label: 'Этаж', align: 'center', merged: true },
  { field: 'room', sortKey: 'room', label: 'Помещение', align: 'center', merged: true },
  { field: 'area_m2', sortKey: 'area_m2', label: 'Площадь', align: 'center', merged: true },
  {
    field: 'current_tenant',
    sortKey: 'current_tenant',
    label: 'Текущий арендатор',
    align: 'start',
    merged: true,
  },
  { field: 'tenant_applicant', sortKey: 'tenant_applicant', label: 'Претендент', align: 'start' },
  { field: 'category', sortKey: 'category', label: 'Категория', align: 'start' },
  { field: 'status', sortKey: 'status', label: 'Статус', align: 'start' },
  {
    field: 'first_contact_date',
    sortKey: 'first_contact_date',
    label: 'Дата 1го контакта',
    align: 'center',
  },
  {
    field: 'next_contact_date',
    sortKey: 'next_contact_date',
    label: 'Дата след. контакта',
    align: 'center',
  },
  {
    field: 'negotiations_info',
    label: 'Информация о переговорах',
    align: 'start',
    multiline: true,
  },
  { field: 'contacts', label: 'Контакты', align: 'start', multiline: true },
  { field: 'responsible', sortKey: 'responsible', label: 'Ответственный', align: 'start' },
]

const displayRows = computed(() => flattenTenantCasesForTable(props.items))

const thAlignClass = {
  start: cssm.thAlignStart,
  center: cssm.thAlignCenter,
} as const

const tdAlignClass = {
  start: cssm.tdStart,
  center: cssm.tdCenter,
} as const

const localSearch = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value),
})

function sortAriaLabel(key: TenantCaseSortKey, label: string): string {
  if (props.sortKey !== key) {
    return `Сортировка по полю «${label}»`
  }

  return props.sortDirection === 'asc'
    ? `Сортировка по полю «${label}»: по возрастанию`
    : `Сортировка по полю «${label}»: по убыванию`
}

function handlePerPageChange(event: Event) {
  emit('perPageChange', Number((event.target as HTMLSelectElement).value))
}

function cellValue(
  row: (typeof displayRows.value)[number],
  field: keyof TenantCaseTableRow,
): string {
  switch (field) {
    case 'area_m2':
      return formatTenantCaseArea(row.area_m2)
    case 'first_contact_date':
    case 'next_contact_date':
    case 'responsible':
      return row[field] ?? '—'
    default:
      return String(row[field] ?? '—')
  }
}
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.toolbar">
      <label :class="$style.search">
        <input
          v-model="localSearch"
          :class="$style.searchInput"
          type="search"
          placeholder="Поиск"
          autocomplete="off"
          aria-label="Поиск по таблице"
        />
      </label>

      <UiButton size="sm" variant="primary" label="Создать" @click="emit('create')" />
    </div>

    <div :class="$style.tableWrapper">
      <table :class="$style.table">
        <thead :class="$style.thead">
          <tr>
            <th
              v-for="column in columns"
              :key="column.field"
              :class="[$style.th, thAlignClass[column.align]]"
            >
              <button
                v-if="column.sortKey"
                type="button"
                :class="$style.sortButton"
                :aria-label="sortAriaLabel(column.sortKey, column.label)"
                @click="emit('sortChange', column.sortKey)"
              >
                <span :class="$style.headerLabel">{{ column.label }}</span>
                <UIcon
                  v-if="sortKey !== column.sortKey"
                  name="i-arrow-chevron-sort"
                  :class="$style.sortIcon"
                  aria-hidden="true"
                />
                <UIcon
                  v-else-if="sortDirection === 'desc'"
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
              <span v-else :class="$style.headerLabel">{{ column.label }}</span>
            </th>
          </tr>
        </thead>

        <tbody :class="$style.tbody">
          <tr v-if="!displayRows.length">
            <td :colspan="columns.length" :class="[$style.td, $style.emptyCell]">
              Нет данных для отображения
            </td>
          </tr>

          <tr v-for="(row, rowIndex) in displayRows" v-else :key="`${row.caseId}-${rowIndex}`" :class="$style.row">
            <template v-for="column in columns" :key="`${row.caseId}-${rowIndex}-${column.field}`">
              <td
                v-if="!column.merged || row.rowSpan > 0"
                :rowspan="column.merged ? row.rowSpan : undefined"
                :class="[
                  $style.td,
                  tdAlignClass[column.align],
                  column.multiline && $style.tdMultiline,
                  column.field === 'current_tenant' && $style.tdTenant,
                ]"
              >
                <template v-if="column.field === 'number'">
                  <div :class="$style.numberCell">
                    <span>{{ row.number }}</span>
                    <NuxtLink :to="`/broker/current/${row.caseId}`" :class="$style.openLink">
                      открыть
                    </NuxtLink>
                  </div>
                </template>
                <template v-else>
                  {{ cellValue(row, column.field) }}
                </template>
              </td>
            </template>
          </tr>
        </tbody>
      </table>

      <div v-if="loading" :class="$style.loadingOverlay" aria-hidden="true">
        <span :class="$style.spinner" />
      </div>
    </div>

    <footer :class="$style.footer">
      <p :class="$style.range">
        Показано с {{ pagination.rangeFrom }} по {{ pagination.rangeTo }} из {{ pagination.total }}
      </p>

      <div :class="$style.perPage">
        <label :class="$style.perPageLabel" for="tenant-cases-per-page">на страницу</label>
        <select
          id="tenant-cases-per-page"
          :class="$style.perPageSelect"
          :value="String(perPage)"
          @change="handlePerPageChange"
        >
          <option
            v-for="option in TENANT_CASES_PER_PAGE_OPTIONS"
            :key="option"
            :value="String(option)"
          >
            {{ option }}
          </option>
        </select>
      </div>

      <ReportsTablePagination
        :current-page="pagination.currentPage"
        :last-page="pagination.lastPage"
        @page-change="emit('pageChange', $event)"
      />
    </footer>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: 100%;
  min-width: 0;
  border-radius: rem(20);
  background-color: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2);
  padding: var(--fs-space-2) var(--fs-space-2) 0;
}

.search {
  flex: 1 1 rem(220);
  max-width: rem(360);
}

.searchInput {
  width: 100%;
  padding: rem(10) rem(14);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(12);
  font: inherit;
  color: var(--fs-color-text);
  background-color: var(--fs-color-bg);

  &::placeholder {
    color: var(--fs-color-text-muted);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.tableWrapper {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
  max-width: 100%;
  background-color: var(--fs-color-bg);
  -webkit-overflow-scrolling: touch;

  scrollbar-width: thin;
  scrollbar-color: var(--fs-figma-stroke-gray) var(--fs-figma-achromatic-light-gray);
}

.table {
  width: 100%;
  min-width: rem(1440);
  border-collapse: separate;
  border-spacing: 0;

  --tenant-cases-header-bg: var(--fs-figma-achromatic-middle-gray);
  --tenant-cases-header-fg: var(--fs-figma-achromatic-white);
  --tenant-cases-header-divider: rgb(255 255 255 / 0.12);
  --tenant-cases-header-divider-soft: rgb(255 255 255 / 0.08);
}

.thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--tenant-cases-header-bg);
}

.th {
  padding: rem(14) rem(12);
  border-bottom: 1px solid var(--tenant-cases-header-divider);
  border-right: 1px solid var(--tenant-cases-header-divider-soft);
  background-color: var(--tenant-cases-header-bg);

  &:last-child {
    border-right: none;
  }
}

.thAlignStart {
  text-align: start;
}

.thAlignCenter {
  text-align: center;
}

.sortButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: rem(6);
  width: 100%;
  padding: 0;
  border: none;
  font-size: rem(12);
  font-weight: 600;
  line-height: 1.2;
  color: var(--tenant-cases-header-fg);
  white-space: nowrap;
  background: transparent;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
    border-radius: rem(4);
  }
}

.headerLabel {
  @include typo.fs-text-body;

  font-size: rem(12);
  font-weight: 600;
}

.sortIcon {
  flex-shrink: 0;
  width: rem(16);
  height: rem(16);
  color: rgb(255 255 255 / 0.72);
}

.sortIconAsc {
  transform: rotate(180deg);
}

.tbody {
  background-color: var(--fs-color-bg);
}

.row {
  transition: background-color 0.16s ease;

  &:nth-child(even) {
    background-color: rgb(244 245 245 / 0.55);
  }
}

.td {
  padding: rem(12) rem(10);
  border-bottom: 1px solid var(--fs-figma-stroke-light-gray);
  border-right: 1px solid var(--fs-figma-stroke-light-gray);
  font-size: rem(13);
  line-height: 1.35;
  color: var(--fs-color-text);
  vertical-align: top;

  &:last-child {
    border-right: none;
  }
}

.tdStart {
  text-align: start;
}

.tdCenter {
  text-align: center;
}

.tdMultiline {
  min-width: rem(180);
  white-space: pre-wrap;
  word-break: break-word;
}

.tdTenant {
  min-width: rem(120);
}

.numberCell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(4);
}

.openLink {
  font-size: rem(12);
  color: var(--fs-color-primary);
  text-decoration: underline;
  text-underline-offset: rem(2);

  &:hover {
    color: var(--fs-figma-main-building-concert-hall);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
    border-radius: rem(4);
  }
}

.emptyCell {
  padding: var(--fs-space-4);
  color: var(--fs-color-text-muted);
  text-align: center;
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
  animation: tenant-cases-spin 0.8s linear infinite;
}

.footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--fs-space-2);
  align-items: center;
  padding: 0 var(--fs-space-2) var(--fs-space-2);

  @media (min-width: #{bp.$tablet}) {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  }
}

.range {
  margin: 0;

  @include typo.fs-text-body;

  color: var(--fs-color-text-muted);
}

.perPage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
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

.footer :global(nav) {
  justify-self: end;
}

@keyframes tenant-cases-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
