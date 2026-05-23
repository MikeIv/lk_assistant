import type { TenantDataTabKey, UiSelectOption } from '#shared/types/tenantData'

export const TENANT_DATA_TABS: ReadonlyArray<{ key: TenantDataTabKey; label: string }> = [
  { key: 'general', label: 'Общее' },
  { key: 'assortment', label: 'Ассортиментный перечень' },
]

export const TENANT_DATA_YES_NO_OPTIONS: UiSelectOption[] = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Нет' },
]

export const TENANT_DATA_TAX_SYSTEM_OPTIONS: UiSelectOption[] = [
  { value: 'osn', label: 'ОСН' },
  { value: 'usn_6', label: 'УСН (6%)' },
  { value: 'usn_dr', label: 'УСН (д-р)' },
  { value: 'psn', label: 'ПСН' },
  { value: 'other', label: 'иное', isCustom: true },
]

export const TENANT_DATA_INTERFACE_OPTIONS: UiSelectOption[] = [
  { value: 'com', label: 'Com' },
  { value: 'usb', label: 'USB' },
  { value: 'bluetooth', label: 'Bluetooth' },
  { value: 'ethernet', label: 'Ethernet' },
]

export const TENANT_DATA_SALE_OF_GOODS_OPTIONS: UiSelectOption[] = [
  { value: 'agregator', label: 'Через агрегатора' },
  { value: 'internetStore', label: 'Собственный интернет-магазин' },
  {
    value: 'both',
    label: 'И то, и другое',
    outputValue: 'Через агрегатора и собственный интернет-магазин',
  },
]
