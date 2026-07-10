<script setup lang="ts">
const columns = ['Претендент', 'Дата', 'Файл'] as const
</script>

<template>
  <article :class="$style.root" role="tabpanel" aria-label="Коммерческие предложения">
    <h3 :class="$style.title">КП</h3>

    <div :class="$style.tableWrap">
      <table :class="$style.table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column" :class="$style.th">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td :class="$style.empty" :colspan="columns.length">
              Пока нет коммерческих предложений
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  @include card.content-card;
}

.title {
  @include card.content-card-title;
}

.tableWrap {
  overflow: auto;
  border-radius: var(--fs-space-1);
  background-color: var(--fs-figma-achromatic-light-gray);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.th {
  padding: rem(8) rem(16);
  text-align: left;
  font-weight: 600;
  color: var(--fs-figma-achromatic-middle-gray);
  border-bottom: rem(1) solid var(--fs-figma-stroke-light-gray);

  @include typo.fs-text-body;
}

.empty {
  padding: rem(20) rem(16);
  color: var(--fs-figma-achromatic-middle-gray);
  text-align: center;

  @include typo.fs-text-body;
}
</style>
