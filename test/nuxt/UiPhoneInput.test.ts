import { describe, expect, it } from 'vitest'
import { mountUi } from '../helpers/mountUi'
import UiPhoneInput from '~/components/ui/UiPhoneInput.vue'

describe('UiPhoneInput', () => {
  it('formats national digits on keydown and emits masked value', async () => {
    const wrapper = await mountUi(UiPhoneInput, {
      props: { modelValue: null },
    })

    const input = wrapper.get('input')
    await input.trigger('focus')

    for (const digit of '9123456789') {
      await input.trigger('keydown', { key: digit })
    }

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['+7 (912) 345 - 67 - 89'])
    expect((input.element as HTMLInputElement).value).toBe('+7 (912) 345 - 67 - 89')
  })

  it('removes last digit on Backspace', async () => {
    const wrapper = await mountUi(UiPhoneInput, {
      props: { modelValue: '+7 (912) 345 - 67 - 89' },
    })

    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['+7 (912) 345 - 67 - 8'])
  })

  it('applies pasted phone text', async () => {
    const wrapper = await mountUi(UiPhoneInput, {
      props: { modelValue: null },
    })

    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('paste', {
      clipboardData: {
        getData: () => '+7 900 111-22-33',
      },
    })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['+7 (900) 111 - 22 - 33'])
  })

  it('emits null when cleared and blur event after blur', async () => {
    const wrapper = await mountUi(UiPhoneInput, {
      props: { modelValue: '+7 (912) 345 - 67 - 89' },
    })

    const input = wrapper.get('input')
    await input.trigger('focus')

    for (let i = 0; i < 10; i += 1) {
      await input.trigger('keydown', { key: 'Backspace' })
    }

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])

    await input.trigger('blur')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('blur')?.length).toBe(1)
  })

  it('ignores keydown when readonly', async () => {
    const wrapper = await mountUi(UiPhoneInput, {
      props: { modelValue: null, readonly: true },
    })

    await wrapper.get('input').trigger('keydown', { key: '9' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
