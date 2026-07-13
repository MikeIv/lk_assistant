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
  { label: 'Номер помещения', value: props.room?.name?.trim() || '—' },
  { label: 'Тип помещения', value: props.room?.category?.trim() || '—' },
  { label: 'Этаж', value: props.room?.floor?.trim() || '—' },
  { label: 'Площадь, м²', value: formatTenantCaseArea(props.room?.area ?? null) },
])
</script>

<template>
  <article :class="$style.root" role="tabpanel" :aria-label="title">
    <!-- Временно скрыт по запросу заказчика; aria-label на article сохраняет доступность. -->
    <h3 :class="$style.title">{{ title }}</h3>

    <div :class="$style.table">
      <BrokerCurrentCaseTableRow
        v-for="parameter in parameters"
        :key="parameter.label"
        :label="parameter.label"
      >
        <span :class="$style.value">{{ parameter.value }}</span>
      </BrokerCurrentCaseTableRow>
    </div>
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

.table {
  display: grid;
  grid-template-columns: max-content minmax(0, rem(420));
  align-items: center;
  column-gap: rem(24);
  row-gap: var(--fs-space-1);
  width: fit-content;
  max-width: 100%;
}

.value {
  display: block;
  width: 100%;
  font-size: rem(14);
  line-height: 1.4;
  font-weight: 600;
  color: var(--fs-figma-achromatic-black);
  text-align: right;
}
</style>
