<script setup lang="ts">
import type { TenantCaseRoom } from '#shared/types/tenantCases'
import { formatTenantCaseArea } from '#shared/utils/tenantCasesNormalize'

const props = defineProps<{
  room: TenantCaseRoom | null
}>()

const title = computed(() => {
  const name = props.room?.name?.trim()
  return name ? `Помещение ${name}` : 'Помещение'
})

const parameters = computed(() => [
  { label: 'Тип помещения', value: props.room?.category?.trim() || '—' },
  { label: 'Этаж', value: props.room?.floor?.trim() || '—' },
  { label: 'Площадь, м²', value: formatTenantCaseArea(props.room?.area ?? null) },
])
</script>

<template>
  <article :class="$style.root" role="tabpanel" :aria-label="title">
    <!-- Временно скрыт по запросу заказчика; aria-label на article сохраняет доступность. -->
    <h3 :class="$style.title">{{ title }}</h3>

    <ul :class="$style.list">
      <li v-for="parameter in parameters" :key="parameter.label" :class="$style.item">
        <span :class="$style.label">{{ parameter.label }}</span>
        <span :class="$style.value">{{ parameter.value }}</span>
      </li>
    </ul>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  @include card.content-card;
  background-color: var(--fs-figma-achromatic-light-gray);
}

.title {
  @include card.content-card-title;
  display: none;
}

.list {
  display: grid;
  grid-template-columns: max-content max-content;
  align-items: center;
  column-gap: rem(24);
  row-gap: var(--fs-space-1);
  width: fit-content;
  max-width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  align-items: center;
  padding: rem(8) rem(16);
  border-radius: var(--fs-space-1);
  background-color: var(--fs-figma-achromatic-white);
}

.label,
.value {
  font-size: rem(14);
  line-height: 1.4;
}

.label {
  color: var(--fs-figma-achromatic-middle-gray);
}

.value {
  color: var(--fs-figma-achromatic-black);
  font-weight: 600;
}
</style>
