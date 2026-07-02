<script setup lang="ts">
import type {
  Premise,
  PremiseSortDirection,
  PremiseSortKey,
  PremisesPagination,
} from '#shared/types/premises'
import { PREMISES_PER_PAGE_OPTIONS } from '#shared/utils/premisesTable'

const props = defineProps<{
  items: Premise[]
  pagination: PremisesPagination
  searchQuery: string
  sortKey: PremiseSortKey
  sortDirection: PremiseSortDirection
  perPage: number
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  pageChange: [page: number]
  perPageChange: [value: number]
  sortChange: [key: PremiseSortKey]
  rowClick: [item: Premise]
  create: []
}>()

const cssm = useCssModule()

const columns = [
  { key: 'id' as const, label: 'id', align: 'center' as const },
  { key: 'room_type' as const, label: 'Тип помещения', align: 'start' as const },
  { key: 'name' as const, label: 'Номер помещения', align: 'start' as const },
  { key: 'floor' as const, label: 'Этаж', align: 'center' as const },
  { key: 'area' as const, label: 'Площадь, м²', align: 'center' as const },
]

const thAlignClass = {
  start: cssm.thAlignStart,
  center: cssm.thAlignCenter,
  end: cssm.thAlignEnd,
} as const

const tdAlignClass = {
  start: cssm.tdStart,
  center: cssm.tdCenter,
  end: cssm.tdEnd,
} as const

const localSearch = computed({
  get: () => props.searchQuery,
  set: (value: string) => emit('update:searchQuery', value),
})

function sortAriaLabel(key: PremiseSortKey, label: string): string {
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

function formatArea(value: number | null): string {
  return value === null ? '—' : value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

function formatText(value: string | null): string {
  return value ?? '—'
}

function cellValue(item: Premise, key: PremiseSortKey): string {
  switch (key) {
    case 'id':
      return String(item.id)
    case 'name':
      return item.name
    case 'floor':
      return formatText(item.floor)
    case 'area':
      return formatArea(item.area)
    case 'room_type':
      return formatText(item.room_type)
    default:
      return '—'
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
              :key="column.key"
              :class="[$style.th, thAlignClass[column.align]]"
            >
              <button
                type="button"
                :class="$style.sortButton"
                :aria-label="sortAriaLabel(column.key, column.label)"
                @click="emit('sortChange', column.key)"
              >
                <span :class="$style.headerLabel">{{ column.label }}</span>
                <UIcon
                  v-if="sortKey !== column.key"
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
            </th>
          </tr>
        </thead>

        <tbody :class="$style.tbody">
          <tr v-if="!items.length">
            <td :colspan="columns.length" :class="[$style.td, $style.emptyCell]">
              Нет данных для отображения
            </td>
          </tr>

          <tr
            v-for="item in items"
            v-else
            :key="item.id"
            :class="$style.row"
            tabindex="0"
            role="button"
            :aria-label="`Редактировать помещение ${item.name}`"
            @click="emit('rowClick', item)"
            @keydown.enter="emit('rowClick', item)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[$style.td, tdAlignClass[column.align]]"
            >
              {{ cellValue(item, column.key) }}
            </td>
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
        <label :class="$style.perPageLabel" for="premises-per-page">на страницу</label>
        <select
          id="premises-per-page"
          :class="$style.perPageSelect"
          :value="String(perPage)"
          @change="handlePerPageChange"
        >
          <option v-for="option in PREMISES_PER_PAGE_OPTIONS" :key="option" :value="String(option)">
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
  overflow: hidden;
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
  overflow: auto;
  width: 100%;
  background-color: var(--fs-color-bg);

  scrollbar-width: thin;
  scrollbar-color: var(--fs-figma-stroke-gray) var(--fs-figma-achromatic-light-gray);
}

.table {
  width: 100%;
  min-width: rem(720);
  border-collapse: separate;
  border-spacing: 0;

  --premises-header-bg: var(--fs-figma-achromatic-middle-gray);
  --premises-header-fg: var(--fs-figma-achromatic-white);
  --premises-header-divider: rgb(255 255 255 / 0.12);
  --premises-header-divider-soft: rgb(255 255 255 / 0.08);
}

.thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: var(--premises-header-bg);
}

.th {
  padding: rem(14) rem(12);
  border-bottom: 1px solid var(--premises-header-divider);
  border-right: 1px solid var(--premises-header-divider-soft);
  background-color: var(--premises-header-bg);

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

.thAlignEnd {
  text-align: end;
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
  color: var(--premises-header-fg);
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
  cursor: pointer;
  transition: background-color 0.16s ease;

  &:hover {
    background-color: rgb(235 153 20 / 0.06);
  }

  &:nth-child(even) {
    background-color: rgb(244 245 245 / 0.55);

    &:hover {
      background-color: rgb(235 153 20 / 0.08);
    }
  }
}

.td {
  padding: rem(12) rem(10);
  border-bottom: 1px solid var(--fs-figma-stroke-light-gray);
  border-right: 1px solid var(--fs-figma-stroke-light-gray);
  font-size: rem(13);
  line-height: 1.35;
  color: var(--fs-color-text);
  vertical-align: middle;

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

.tdEnd {
  text-align: end;
  font-variant-numeric: tabular-nums;
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
  animation: premises-spin 0.8s linear infinite;
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

@keyframes premises-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
