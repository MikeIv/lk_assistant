<script setup lang="ts">
import ReportTableActionButton from '~/components/reports/cells/ReportTableActionButton.vue'
import { useReportsTableContext } from '~/composables/reports/reportsTableContext'
import type { ReportItem } from '#shared/types/reports'

const props = defineProps<{
  report: ReportItem
}>()

const { isMockMode, downloadReport, downloadAttachments, isReportDownloading, isAttachmentsDownloading } =
  useReportsTableContext()

const isReportBusy = computed(() => isReportDownloading(props.report.id))
const isAttachmentsBusy = computed(() => isAttachmentsDownloading(props.report.id))

async function onDownloadReport() {
  if (isMockMode.value || isReportBusy.value) {
    return
  }

  await downloadReport(props.report.id)
}

async function onDownloadAttachments() {
  if (isMockMode.value || isAttachmentsBusy.value) {
    return
  }

  await downloadAttachments(props.report.id)
}
</script>

<template>
  <div v-if="report.can_download_documents" :class="$style.root">
    <ReportTableActionButton
      label="Отчёт"
      :loading="isReportBusy"
      :disabled="isMockMode"
      fixed-width
      :title="isMockMode ? 'Доступно после подключения API' : undefined"
      @click="onDownloadReport"
    />
    <ReportTableActionButton
      label="Вложения"
      :loading="isAttachmentsBusy"
      :disabled="isMockMode"
      @click="onDownloadAttachments"
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
