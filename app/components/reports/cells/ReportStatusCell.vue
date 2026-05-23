<script setup lang="ts">
import { REPORT_STATUS_COLORS, REPORT_STATUS_LABELS } from '#shared/constants/reportsStatus'
import type { ReportStatus } from '#shared/types/reports'

defineProps<{
  status: ReportStatus
}>()
</script>

<template>
  <div :class="$style.root">
    <span :class="$style.label">{{ REPORT_STATUS_LABELS[status] }}</span>
    <span :class="$style.line" :style="{ backgroundColor: REPORT_STATUS_COLORS[status] }" />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fs-space-1);
  min-width: rem(140);
}

.label {
  font-size: rem(12);
  font-weight: 500;
  line-height: 1.3;
  color: var(--fs-color-text);
  text-align: center;
}

.line {
  width: 100%;
  height: rem(3);
  border-radius: rem(2);
}
</style>
