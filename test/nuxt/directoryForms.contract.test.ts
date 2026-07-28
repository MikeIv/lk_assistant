import { afterEach, describe, expect, it } from 'vitest'
import { runComposable } from '../helpers/runComposable'
import { useCategoryForm } from '~/composables/useCategoryForm'
import { useRoomTypeForm } from '~/composables/useRoomTypeForm'
import { useNegotiationStatusForm } from '~/composables/useNegotiationStatusForm'

const forms = [
  {
    name: 'category',
    setup: () => useCategoryForm({ name: 'Initial' }),
    fieldError: { name: 'server name error' } as const,
  },
  {
    name: 'roomType',
    setup: () => useRoomTypeForm({ name: 'Initial' }),
    fieldError: { name: 'server name error' } as const,
  },
  {
    name: 'negotiationStatus',
    setup: () => useNegotiationStatusForm({ name: 'Initial' }),
    fieldError: { name: 'server name error' } as const,
  },
]

const unmounts: Array<() => void> = []

describe.each(forms)('name-only form: $name', (contract) => {
  afterEach(() => {
    while (unmounts.length) {
      unmounts.pop()?.()
    }
  })

  it('toPayload trims name and applyServerFieldErrors sets field', () => {
    const { result, unmount } = runComposable(() => contract.setup())
    unmounts.push(unmount)

    result.name.value = '  Trimmed  '
    expect(result.toPayload()).toEqual({ name: 'Trimmed' })

    result.applyServerFieldErrors(contract.fieldError)
    expect(result.errors.value.name).toBe('server name error')
  })
})
