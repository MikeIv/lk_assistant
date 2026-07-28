import { describe, expect, it } from 'vitest'
import type { UiSelectOption } from '#shared/types/tenantData'
import { findListboxOptions, mountUi } from '../helpers/mountUi'
import UiMultiSelect from '~/components/ui/UiMultiSelect.vue'

const options: UiSelectOption[] = [
  { value: '1', label: 'A' },
  { value: '2', label: 'B' },
  { value: '3', label: 'C' },
]

describe('UiMultiSelect', () => {
  it('shows placeholder when empty', async () => {
    const wrapper = await mountUi(UiMultiSelect, {
      props: { options, modelValue: null, placeholder: 'Не выбрано' },
    })

    expect(wrapper.text()).toContain('Не выбрано')
  })

  it('toggles options into a comma-joined modelValue', async () => {
    const wrapper = await mountUi(UiMultiSelect, {
      props: { options, modelValue: null },
    })

    await wrapper.get('button[aria-expanded]').trigger('click')

    await findListboxOptions(wrapper)[0]!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['A'])

    await wrapper.setProps({ modelValue: 'A' })
    await findListboxOptions(wrapper)[2]!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['A, C'])
  })

  it('deselects an option and emits null when none left', async () => {
    const wrapper = await mountUi(UiMultiSelect, {
      props: { options, modelValue: 'A, B' },
    })

    expect(wrapper.text()).toContain('A, B')

    await wrapper.get('button[aria-expanded]').trigger('click')
    await findListboxOptions(wrapper)[0]!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['B'])

    await wrapper.setProps({ modelValue: 'B' })
    await findListboxOptions(wrapper)[1]!.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
  })
})
