import { describe, expect, it } from 'vitest'
import { mountUi } from '../helpers/mountUi'
import UiDateInput from '~/components/ui/UiDateInput.vue'

describe('UiDateInput', () => {
  it('shows placeholder when empty', async () => {
    const wrapper = await mountUi(UiDateInput, {
      props: { modelValue: '', placeholder: 'дд.мм.гггг' },
    })

    expect(wrapper.text()).toContain('дд.мм.гггг')
  })

  it('updates modelValue on input', async () => {
    const wrapper = await mountUi(UiDateInput, {
      props: { modelValue: '' },
    })

    const input = wrapper.get('input[type="date"]')
    await input.setValue('2026-07-28')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2026-07-28'])
  })

  it('hides placeholder when filled', async () => {
    const wrapper = await mountUi(UiDateInput, {
      props: { modelValue: '2026-01-15', placeholder: 'дд.мм.гггг' },
    })

    expect(wrapper.text()).not.toContain('дд.мм.гггг')
    expect((wrapper.get('input[type="date"]').element as HTMLInputElement).value).toBe('2026-01-15')
  })

  it('disables input and calendar button when disabled', async () => {
    const wrapper = await mountUi(UiDateInput, {
      props: { modelValue: '', disabled: true },
    })

    expect(wrapper.get('input[type="date"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })
})
