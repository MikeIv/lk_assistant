<script setup lang="ts">
import ReportTableActionButton from '~/components/reports/cells/ReportTableActionButton.vue'
import { useReportsTableContext } from '~/composables/reports/reportsTableContext'
import type { ReportItem } from '#shared/types/reports'

const props = defineProps<{
  report: ReportItem
}>()

const { isMockMode, openCorrection } = useReportsTableContext()

const canShow = computed(() => props.report.can_request_correction)

function onClick() {
  if (isMockMode.value) {
    return
  }

  openCorrection(props.report.id)
}
</script>

<template>
  <ReportTableActionButton
    v-if="canShow"
    label="Запросить"
    :disabled="isMockMode"
    :title="isMockMode ? 'Доступно после подключения API' : undefined"
    @click="onClick"
  />
</template>
