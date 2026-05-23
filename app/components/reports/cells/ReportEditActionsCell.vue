<script setup lang="ts">
import ReportTableActionButton from '~/components/reports/cells/ReportTableActionButton.vue'
import { useReportsTableContext } from '~/composables/reports/reportsTableContext'
import type { ReportItem } from '#shared/types/reports'

const props = defineProps<{
  report: ReportItem
}>()

const { isMockMode } = useReportsTableContext()

const canEdit = computed(
  () =>
    props.report.can_edit &&
    (props.report.status === 'Draft' ||
      props.report.status === 'Editable' ||
      props.report.status === 'Overdue'),
)

function onEdit() {
  if (isMockMode.value) {
    return
  }

  // TODO: маршрут редактора отчёта появится в отдельной задаче
}

function onDelete() {
  if (isMockMode.value) {
    return
  }

  // TODO: удаление черновика через API
}
</script>

<template>
  <div v-if="canEdit" :class="$style.root">
    <ReportTableActionButton
      label="Редактировать"
      :disabled="isMockMode"
      :title="isMockMode ? 'Доступно после подключения API' : undefined"
      @click="onEdit"
    />
    <ReportTableActionButton
      v-if="report.status === 'Draft'"
      label="Удалить"
      variant="soft"
      :disabled="isMockMode"
      :title="isMockMode ? 'Доступно после подключения API' : undefined"
      @click="onDelete"
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
