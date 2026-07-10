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
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  @include card.content-card;
}

.title {
  @include card.content-card-title;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  @include card.param-row;
}

.label {
  @include card.param-label;
}

.value {
  @include card.param-value;
}
</style>
