import { describe, expect, it } from 'vitest'
import type { UiSelectOption } from '#shared/types/tenantData'
import { findListboxOptions, mountUi } from '../helpers/mountUi'
import UiCombobox from '~/components/ui/UiCombobox.vue'

const options: UiSelectOption[] = [
  { value: 'a', label: 'Офис' },
  { value: 'b', label: 'Склад' },
  { value: 'custom', label: 'Своё значение', isCustom: true },
]

describe('UiCombobox', () => {
  it('emits selected option label and closes', async () => {
    const wrapper = await mountUi(UiCombobox, {
      props: { options, modelValue: null, isCustom: false },
    })

    await wrapper.get('button[aria-label="Открыть список"]').trigger('click')
    await findListboxOptions(wrapper)[1]!.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Склад'])
    expect(wrapper.emitted('update:isCustom')?.at(-1)).toEqual([false])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('switches to custom mode and clears value', async () => {
    const wrapper = await mountUi(UiCombobox, {
      props: { options, modelValue: 'Офис', isCustom: false },
    })

    await wrapper.get('button[aria-label="Открыть список"]').trigger('click')
    await findListboxOptions(wrapper)[2]!.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:isCustom')?.at(-1)).toEqual([true])
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })

  it('emits typed text in custom mode and null for blank', async () => {
    const wrapper = await mountUi(UiCombobox, {
      props: { options, modelValue: null, isCustom: true },
    })

    const input = wrapper.get('input')
    expect(input.attributes('readonly')).toBeUndefined()

    await input.setValue('Кастом')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Кастом'])

    await input.setValue('   ')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })
})
