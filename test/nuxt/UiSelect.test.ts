import { describe, expect, it } from 'vitest'
import type { UiSelectOption } from '#shared/types/tenantData'
import { findListboxOptions, mountUi } from '../helpers/mountUi'
import UiSelect from '~/components/ui/UiSelect.vue'

const options: UiSelectOption[] = [
  { value: '1', label: 'Альфа', outputValue: 'alpha' },
  { value: '2', label: 'Бета Групп', outputValue: 'beta' },
  { value: '3', label: 'Гамма', outputValue: 'gamma' },
]

describe('UiSelect', () => {
  it('shows placeholder when empty and opens options on click', async () => {
    const wrapper = await mountUi(UiSelect, {
      props: { options, modelValue: null, placeholder: 'Выберите' },
    })

    expect(wrapper.text()).toContain('Выберите')

    await wrapper.get('button[aria-expanded]').trigger('click')

    const labels = findListboxOptions(wrapper).map((el) => el.textContent?.trim())
    expect(labels).toEqual(['Альфа', 'Бета Групп', 'Гамма'])
  })

  it('emits outputValue on select and closes the list', async () => {
    const wrapper = await mountUi(UiSelect, {
      props: { options, modelValue: null },
    })

    await wrapper.get('button[aria-expanded]').trigger('click')
    await findListboxOptions(wrapper)[1]!.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['beta'])
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('filters options in searchable mode', async () => {
    const wrapper = await mountUi(UiSelect, {
      props: { options, modelValue: null, searchable: true },
    })

    const input = wrapper.get('input')
    await input.trigger('click')
    await input.setValue('бета')

    const labels = findListboxOptions(wrapper).map((el) => el.textContent?.trim())
    expect(labels).toEqual(['Бета Групп'])
  })

  it('marks trigger as disabled', async () => {
    const wrapper = await mountUi(UiSelect, {
      props: { options, modelValue: null, disabled: true },
    })

    expect(wrapper.get('button[aria-expanded]').attributes('disabled')).toBeDefined()
  })

  it('resolves display label from modelValue by outputValue', async () => {
    const wrapper = await mountUi(UiSelect, {
      props: { options, modelValue: 'gamma' },
    })

    expect(wrapper.text()).toContain('Гамма')
  })
})
