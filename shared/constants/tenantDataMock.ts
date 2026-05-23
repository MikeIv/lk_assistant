import type { TenantDataInfo } from '#shared/types/tenantData'

/** Мок данных арендатора — шаблон до согласования контента и подключения API. */
export const TENANT_DATA_MOCK: TenantDataInfo = {
  general: {
    tax_system: {
      value: 'УСН (6%)',
      is_custom: false,
    },
    nds: '20',
    inn: '7701234567',
    kpp: '770101001',
    franchise: {
      value: 'Нет',
    },
    cashier_name: 'iikoFront',
    printer_model: 'АТОЛ 30Ф',
    is_agent: {
      value: 'Нет',
    },
    software: 'iiko',
    is_ofd: true,
    ofd_use: 'ОФД Яндекс',
    ofd_link: 'https://ofd.yandex.ru',
    ofd_login: 'tenant@example.com',
    ofd_password: '••••••••',
    database: 'PostgreSQL',
    interface_value: 'Ethernet, USB',
    pick_up_point: {
      value: 'Нет',
    },
    internet_sell: {
      value: 'Да',
    },
    sale_of_goods: 'Через агрегатора',
  },
  assortment: {
    permitted_use: {
      id: 101,
      name: 'Разрешенное использование.pdf',
      url: '#mock-permitted-use',
      mime_type: 'application/pdf',
      size: 524_288,
      created_at: '2025-11-12T09:00:00.000000Z',
      updated_at: '2025-11-12T09:00:00.000000Z',
    },
    permitted_use_placeholder: null,
    product_range_list_contract: {
      id: 102,
      name: 'Ассортимент по договору.xlsx',
      url: '#mock-product-range',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 1_048_576,
      created_at: '2025-10-01T12:30:00.000000Z',
      updated_at: '2025-10-01T12:30:00.000000Z',
    },
    product_range_list_contract_placeholder: null,
    detailed_assortment_list: null,
    detailed_assortment_list_placeholder: 'Добавьте Excel с детализированным перечнем товаров',
    provided_services_list: null,
    provided_services_list_placeholder: 'Добавьте Excel со списком услуг и работ',
  },
}
