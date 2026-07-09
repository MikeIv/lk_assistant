<script setup lang="ts">
import type { TenantCaseRoom } from '#shared/types/tenantCases'
import { formatTenantCaseArea } from '#shared/utils/tenantCasesNormalize'

const props = defineProps<{
  room: TenantCaseRoom | null
}>()

const typeValue = computed(() => props.room?.category?.trim() || '—')
const nameValue = computed(() => props.room?.name?.trim() || '—')
const floorValue = computed(() => props.room?.floor?.trim() || '—')
const areaValue = computed(() => formatTenantCaseArea(props.room?.area ?? null))
</script>

<template>
  <div :class="$style.root" role="tabpanel">
    <BrokerCurrentCaseTableRow label="Тип помещения">
      <UiInput :model-value="typeValue" readonly />
    </BrokerCurrentCaseTableRow>
    <BrokerCurrentCaseTableRow label="Номер помещения">
      <UiInput :model-value="nameValue" readonly />
    </BrokerCurrentCaseTableRow>
    <BrokerCurrentCaseTableRow label="Этаж">
      <UiInput :model-value="floorValue" readonly />
    </BrokerCurrentCaseTableRow>
    <BrokerCurrentCaseTableRow label="Площадь">
      <UiInput :model-value="areaValue" readonly />
    </BrokerCurrentCaseTableRow>
  </div>
</template>

<style module lang="scss">
.root {
  display: flex;
  flex-direction: column;
}
</style>
