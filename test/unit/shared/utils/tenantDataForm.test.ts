import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createMockUploadedFile,
  formatFileSize,
  formatNdsOnBlur,
  sanitizeNdsInput,
} from '#shared/utils/tenantDataForm'

describe('tenantDataForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('formats file sizes', () => {
    expect(formatFileSize(500)).toBe('500 Б')
    expect(formatFileSize(2048)).toBe('2.00 Кб')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 Мб')
  })

  it('creates mock uploaded file via object URL', () => {
    const createObjectURL = vi.fn(() => 'blob:mock')
    vi.stubGlobal('URL', { createObjectURL })

    const file = new File(['hello'], 'doc.pdf', { type: 'application/pdf' })
    const uploaded = createMockUploadedFile(file, 7)

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(uploaded).toMatchObject({
      id: 7,
      name: 'doc.pdf',
      url: 'blob:mock',
      mime_type: 'application/pdf',
      size: 5,
    })
  })

  it('sanitizes and clamps NDS input', () => {
    expect(sanitizeNdsInput('12a3bc9999')).toBe('12399')
    expect(formatNdsOnBlur('')).toBe('')
    expect(formatNdsOnBlur('abc')).toBe('')
    expect(formatNdsOnBlur('150')).toBe('100')
    expect(formatNdsOnBlur('-5')).toBe('0')
    expect(formatNdsOnBlur('20')).toBe('20')
  })
})
