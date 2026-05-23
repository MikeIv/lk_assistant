import type { TenantUploadedFile } from '#shared/types/tenantData'

/** Форматирование размера файла для карточки документа. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`
  }

  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(kb >= 100 ? 0 : 2)} Кб`
  }

  const mb = kb / 1024
  return `${mb.toFixed(2)} Мб`
}

/** Локальный mock-файл из выбранного в input File (без загрузки на сервер). */
export function createMockUploadedFile(file: File, id: number): TenantUploadedFile {
  return {
    id,
    name: file.name,
    url: URL.createObjectURL(file),
    mime_type: file.type || 'application/octet-stream',
    size: file.size,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/** Нормализация ставки НДС при blur (из LK-Shelk). */
export function formatNdsOnBlur(value: string): string {
  const trimmed = value.trim()
  if (trimmed === '') {
    return ''
  }

  const numeric = Number.parseInt(trimmed, 10)
  if (Number.isNaN(numeric)) {
    return ''
  }

  return String(Math.min(Math.max(numeric, 0), 100))
}

export function sanitizeNdsInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 5)
}
