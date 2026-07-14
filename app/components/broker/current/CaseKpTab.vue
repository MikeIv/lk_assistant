<script setup lang="ts">
const columns = [
  { key: 'applicant', label: 'Претендент', align: 'start' },
  { key: 'date', label: 'Дата', align: 'center' },
  { key: 'file', label: 'Файл', align: 'start' },
] as const
</script>

<template>
  <div :class="$style.root" role="tabpanel" aria-label="Коммерческие предложения">
    <article :class="$style.card">
      <h3 :class="$style.title">Коммерческие предложения</h3>

      <div :class="$style.tableWrapper">
        <table :class="$style.table">
          <thead :class="$style.thead">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :class="[
                  $style.th,
                  column.align === 'center' ? $style.thAlignCenter : $style.thAlignStart,
                ]"
              >
                <span :class="$style.headerLabel">{{ column.label }}</span>
              </th>
            </tr>
          </thead>
          <tbody :class="$style.tbody">
            <tr>
              <td :colspan="columns.length" :class="[$style.td, $style.emptyCell]">
                Пока нет сформированных коммерческих предложений
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <div :class="$style.action">
      <UiButton type="button" size="sm" variant="success" label="Сформировать КП" />
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.card {
  @include card.content-card;
}

.action {
  align-self: flex-start;
}

.title {
  @include card.content-card-title;
}

.tableWrapper {
  overflow: auto;
  width: 100%;
  border-radius: var(--fs-space-1);
  background-color: var(--fs-color-bg);

  scrollbar-width: thin;
  scrollbar-color: var(--fs-figma-stroke-gray) var(--fs-figma-achromatic-light-gray);
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;

  --kp-table-header-bg: var(--fs-figma-achromatic-middle-gray);
  --kp-table-header-fg: var(--fs-figma-achromatic-white);
  --kp-table-header-divider: rgb(255 255 255 / 0.12);
  --kp-table-header-divider-soft: rgb(255 255 255 / 0.08);
}

.thead {
  background-color: var(--kp-table-header-bg);
}

.th {
  padding: rem(14) rem(12);
  border-bottom: 1px solid var(--kp-table-header-divider);
  border-right: 1px solid var(--kp-table-header-divider-soft);
  background-color: var(--kp-table-header-bg);
  color: var(--kp-table-header-fg);

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

.headerLabel {
  @include typo.fs-text-body;

  font-size: rem(12);
  font-weight: 600;
}

.tbody {
  background-color: var(--fs-color-bg);
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

.emptyCell {
  padding: var(--fs-space-4);
  color: var(--fs-color-text-muted);
  text-align: center;
}
</style>
