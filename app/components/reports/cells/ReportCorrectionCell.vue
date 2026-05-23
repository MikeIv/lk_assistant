<script setup lang="ts">
import type { ReportItem } from '#shared/types/reports'

defineProps<{
  report: ReportItem
}>()
</script>

<template>
  <UiButton
    v-if="report.can_request_correction"
    size="sm"
    variant="outline"
    label="Запросить"
    fit
    @click.prevent
  />
</template>
