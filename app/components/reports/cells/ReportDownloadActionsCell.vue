<script setup lang="ts">
import type { ReportItem } from '#shared/types/reports'

defineProps<{
  report: ReportItem
}>()
</script>

<template>
  <div v-if="report.can_download_documents" :class="$style.root">
    <UiButton size="sm" variant="outline" label="Отчёт" fit @click.prevent />
    <UiButton size="sm" variant="outline" label="Вложения" fit @click.prevent />
  </div>
</template>

<style module lang="scss">
.root {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--fs-space-1);
}
</style>
