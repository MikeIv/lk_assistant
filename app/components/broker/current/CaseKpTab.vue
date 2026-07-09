<script setup lang="ts">
const columns = ['Претендент', 'Дата', 'Файл'] as const
</script>

<template>
  <div :class="$style.root" role="tabpanel">
    <div :class="$style.tableWrap">
      <table :class="$style.table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column" :class="$style.th">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td :class="$style.empty" colspan="3">Пока нет коммерческих предложений</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
}

.tableWrap {
  overflow: auto;
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(12);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.th {
  padding: rem(12) rem(14);
  border-bottom: 1px solid var(--fs-figma-stroke-light-gray);
  background: var(--fs-figma-achromatic-light-gray);
  text-align: left;
  font-weight: 600;
  color: var(--fs-color-text);

  @include typo.fs-text-body;
}

.empty {
  padding: rem(20) rem(14);
  color: var(--fs-color-text-muted);
  text-align: center;

  @include typo.fs-text-body;
}
</style>
