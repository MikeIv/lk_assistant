<script setup lang="ts">
import type { TenantAssortmentInfo, TenantUploadedFile } from '#shared/types/tenantData'

const assortment = defineModel<TenantAssortmentInfo>({ required: true })

function setDetailedAssortment(file: TenantUploadedFile) {
  assortment.value.detailed_assortment_list = file
}

function setProvidedServices(file: TenantUploadedFile) {
  assortment.value.provided_services_list = file
}
</script>

<template>
  <div :class="$style.root">
    <UiDocumentCard
      title="Разрешенное использование"
      subtitle="Добавьте или удалите вложение"
      :file="assortment.permitted_use"
      button-label="Нет файла"
      readonly
    />

    <UiDocumentCard
      title="Ассортиментный перечень по договору / Меню"
      subtitle="Добавьте или удалите вложение"
      :file="assortment.product_range_list_contract"
      button-label="Нет файла"
      readonly
    />

    <UiDocumentCard
      title="Детализированный ассортиментный перечень (товары)"
      subtitle="Добавьте или удалите вложение"
      :file="assortment.detailed_assortment_list"
      button-label="Добавить Excel"
      accept=".xls,.xlsx"
      @select="setDetailedAssortment"
      @clear="assortment.detailed_assortment_list = null"
    />

    <UiDocumentCard
      title="Список оказываемых услуг / выполняемых работ"
      subtitle="Добавьте или удалите вложение"
      :file="assortment.provided_services_list"
      button-label="Добавить Excel"
      accept=".xls,.xlsx"
      @select="setProvidedServices"
      @clear="assortment.provided_services_list = null"
    />
  </div>
</template>

<style module lang="scss">
.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-4);
  width: 100%;
}
</style>
