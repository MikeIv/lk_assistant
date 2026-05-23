/** Файл, загруженный на сервер (аналог commerce-types из LK-Shelk). */
export interface TenantUploadedFile {
  id: number
  name: string
  url: string
  mime_type: string
  size: number
  created_at: string | null
  updated_at: string | null
  is_request_change_file?: boolean
}

export interface TenantGeneralInfo {
  tax_system: {
    value: string | null
    is_custom: boolean
  }
  nds: string | null
  inn: string | null
  kpp: string | null
  franchise: {
    value: string | null
  }
  cashier_name: string | null
  printer_model: string | null
  is_agent: {
    value: string | null
  }
  software: string | null
  is_ofd: boolean
  ofd_use: string | null
  ofd_link: string | null
  ofd_login: string | null
  ofd_password: string | null
  database: string | null
  interface_value: string | null
  pick_up_point: {
    value: string | null
  }
  internet_sell: {
    value: string | null
  }
  sale_of_goods: string | null
}

export interface TenantAssortmentInfo {
  permitted_use: TenantUploadedFile | null
  permitted_use_placeholder: string | null
  product_range_list_contract: TenantUploadedFile | null
  product_range_list_contract_placeholder: string | null
  detailed_assortment_list: TenantUploadedFile | null
  detailed_assortment_list_placeholder: string | null
  provided_services_list: TenantUploadedFile | null
  provided_services_list_placeholder: string | null
}

export interface TenantDataInfo {
  general: TenantGeneralInfo
  assortment: TenantAssortmentInfo
}

export type TenantDataTabKey = 'general' | 'assortment'

export interface UiSelectOption {
  value: string
  label: string
  outputValue?: string
  isCustom?: boolean
}
