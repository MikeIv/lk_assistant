<script setup lang="ts">
import type { ReportItem } from '#shared/types/reports'

defineProps<{
  report: ReportItem
}>()
</script>

<template>
  <div v-if="report.can_edit && (report.status === 'Draft' || report.status === 'Editable' || report.status === 'Overdue')" :class="$style.root">
    <UiButton size="sm" variant="outline" label="Редактировать" fit @click.prevent />
    <UiButton
      v-if="report.status === 'Draft'"
      size="sm"
      variant="soft"
      label="Удалить"
      fit
      @click.prevent
    />
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
