<script setup lang="ts">
import {
  formatNdsOnBlur,
  sanitizeNdsInput,
} from '#shared/utils/tenantDataForm'
import {
  TENANT_DATA_INTERFACE_OPTIONS,
  TENANT_DATA_SALE_OF_GOODS_OPTIONS,
  TENANT_DATA_TAX_SYSTEM_OPTIONS,
  TENANT_DATA_YES_NO_OPTIONS,
} from '#shared/constants/tenantDataOptions'
import type { TenantGeneralInfo } from '#shared/types/tenantData'

const general = defineModel<TenantGeneralInfo>({ required: true })

function bindNullableString(
  read: () => string | null,
  write: (value: string | null) => void,
) {
  return computed({
    get: () => read() ?? '',
    set: (value: string) => write(value.trim() === '' ? null : value),
  })
}

const ndsValue = computed({
  get: () => general.value.nds ?? '',
  set: (value: string) => {
    general.value.nds = sanitizeNdsInput(value)
  },
})

const cashierName = bindNullableString(
  () => general.value.cashier_name,
  (value) => {
    general.value.cashier_name = value
  },
)

const printerModel = bindNullableString(
  () => general.value.printer_model,
  (value) => {
    general.value.printer_model = value
  },
)

const software = bindNullableString(
  () => general.value.software,
  (value) => {
    general.value.software = value
  },
)

const database = bindNullableString(
  () => general.value.database,
  (value) => {
    general.value.database = value
  },
)

const ofdUse = bindNullableString(
  () => general.value.ofd_use,
  (value) => {
    general.value.ofd_use = value
  },
)

const ofdLink = bindNullableString(
  () => general.value.ofd_link,
  (value) => {
    general.value.ofd_link = value
  },
)

const ofdLogin = bindNullableString(
  () => general.value.ofd_login,
  (value) => {
    general.value.ofd_login = value
  },
)

const ofdPassword = bindNullableString(
  () => general.value.ofd_password,
  (value) => {
    general.value.ofd_password = value
  },
)

const taxSystemValue = computed({
  get: () => general.value.tax_system.value,
  set: (value: string | null) => {
    general.value.tax_system.value = value
  },
})

const taxSystemIsCustom = computed({
  get: () => general.value.tax_system.is_custom,
  set: (value: boolean) => {
    general.value.tax_system.is_custom = value
  },
})

const isSaleOfGoodsDisabled = computed(
  () => general.value.internet_sell.value === 'Нет' || general.value.internet_sell.value === null,
)

watch(
  () => general.value.internet_sell.value,
  (value) => {
    if (value === 'Нет' || value === null) {
      general.value.sale_of_goods = null
    }
  },
)
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.column">
      <DataField label="Применяемая система налогообложения:">
        <UiCombobox
          v-model="taxSystemValue"
          v-model:is-custom="taxSystemIsCustom"
          :options="TENANT_DATA_TAX_SYSTEM_OPTIONS"
        />
      </DataField>

      <DataField label="Применяемая ставка НДС, %:">
        <UiInput
          v-model="ndsValue"
          inputmode="numeric"
          placeholder="Введите значение"
          @blur="general.nds = formatNdsOnBlur(general.nds ?? '') || null"
        />
      </DataField>

      <DataField label="ИНН:">
        <UiInput :model-value="general.inn ?? ''" readonly />
      </DataField>

      <DataField label="КПП:">
        <UiInput :model-value="general.kpp ?? ''" readonly />
      </DataField>

      <DataField label="Являетесь ли Вы компанией-франчайзи?">
        <UiSelect v-model="general.franchise.value" :options="TENANT_DATA_YES_NO_OPTIONS" />
      </DataField>
    </div>

    <div :class="$style.column">
      <DataField label="Название кассового ПО:">
        <UiInput v-model="cashierName" placeholder="Введите название" />
      </DataField>

      <DataField label="Модель фискального регистратора/принтера чеков:">
        <UiInput v-model="printerModel" placeholder="Например, Штрих-Мини ФР-К, СП-101" />
      </DataField>

      <DataField label="Выступаете ли Вы Агентом/Комиссионером/Поверенным:">
        <UiSelect v-model="general.is_agent.value" :options="TENANT_DATA_YES_NO_OPTIONS" />
      </DataField>

      <DataField label="Используемое ПО:">
        <UiInput v-model="software" placeholder="Например, R-keeper / IIKO / 1C" />
      </DataField>

      <template v-if="general.is_ofd">
        <div :class="$style.ofdRow">
          <DataField label="Используемый ОФД:">
            <UiInput v-model="ofdUse" placeholder="Введите название" />
          </DataField>
          <DataField label="Ссылка на ЛК ОФД:">
            <UiInput v-model="ofdLink" placeholder="https://..." />
          </DataField>
        </div>

        <div :class="$style.ofdRow">
          <DataField label="Логин от ЛК ОФД:">
            <UiInput v-model="ofdLogin" placeholder="Введите логин" />
          </DataField>
          <DataField label="Пароль от ЛК ОФД:">
            <UiInput v-model="ofdPassword" placeholder="Введите пароль" />
          </DataField>
        </div>
      </template>
    </div>

    <div :class="$style.column">
      <DataField label="Тип СУБД (базы данных) кассового ПО:">
        <UiInput v-model="database" placeholder="Например, 1С / MSSQL" />
      </DataField>

      <DataField label="Интерфейс передачи данных:">
        <UiMultiSelect v-model="general.interface_value" :options="TENANT_DATA_INTERFACE_OPTIONS" />
      </DataField>

      <DataField label="Используется ли Помещение как ПВЗ?">
        <UiSelect v-model="general.pick_up_point.value" :options="TENANT_DATA_YES_NO_OPTIONS" />
      </DataField>

      <DataField label="В Помещении реализуются товары через Интернет?">
        <UiSelect v-model="general.internet_sell.value" :options="TENANT_DATA_YES_NO_OPTIONS" />
      </DataField>

      <DataField label="При реализации товаров через Интернет работа ведется:">
        <UiSelect
          v-model="general.sale_of_goods"
          :options="TENANT_DATA_SALE_OF_GOODS_OPTIONS"
          :disabled="isSaleOfGoodsDisabled"
        />
      </DataField>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-3);
  width: 100%;

  @media (min-width: bp.$tablet) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: bp.$desktopMin) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.column {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.ofdRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--fs-space-2);

  @media (min-width: bp.$tablet) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
