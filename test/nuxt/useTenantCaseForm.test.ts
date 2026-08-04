import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { runComposable } from '../helpers/runComposable'
import { useTenantCaseForm } from '~/composables/useTenantCaseForm'

const unmounts: Array<() => void> = []

describe('useTenantCaseForm', () => {
  afterEach(() => {
    while (unmounts.length) {
      unmounts.pop()?.()
    }
  })

  function mountForm() {
    const { result, unmount } = runComposable(() => useTenantCaseForm())
    unmounts.push(unmount)
    return result
  }

  it('starts with one empty applicant and blocks submit until required fields filled', async () => {
    const form = mountForm()

    expect(form.applicants.value).toHaveLength(1)
    expect(form.roomId.value).toBe('')

    const submitted = vi.fn()
    const onInvalid = vi.fn()
    const handle = form.handleSubmit(submitted, { onInvalid })

    await expect(handle()).resolves.toBe(false)
    expect(submitted).not.toHaveBeenCalled()
    expect(onInvalid).toHaveBeenCalledOnce()
    expect(form.applicantsError.value).toBeTruthy()
  })

  it('add/remove applicant and negotiation with guards', async () => {
    const form = mountForm()

    form.addApplicant()
    expect(form.applicants.value).toHaveLength(2)

    form.removeApplicant(0)
    expect(form.applicants.value).toHaveLength(1)

    form.removeApplicant(0)
    expect(form.applicants.value).toHaveLength(1)

    form.addNegotiation(0)
    expect(form.applicants.value[0]!.negotiations).toHaveLength(2)

    form.removeNegotiation(0, 0)
    expect(form.applicants.value[0]!.negotiations).toHaveLength(2)

    form.removeNegotiation(0, 1)
    expect(form.applicants.value[0]!.negotiations).toHaveLength(1)
  })

  it('loadTenantCaseForm / reset / toPayload / toStorePayload', async () => {
    const form = mountForm()

    form.loadTenantCaseForm({ room_id: '12', responsible: '7' }, [
      {
        id: 100,
        tenant_applicant_id: 3,
        tenant_applicant: 'Coffee House',
        category: 'Общепит',
        status: 'переговоры',
        negotiation_status_id: 1,
        first_contact_date: '2026-07-01',
        next_contact_date: '2026-07-10',
        negotiations: [{ date: '2026-07-02', info: 'Звонок' }],
      },
    ])
    await nextTick()

    expect(form.roomId.value).toBe('12')
    expect(form.responsible.value).toBe('7')
    expect(form.applicants.value).toHaveLength(1)
    expect(form.applicants.value[0]!.tenant_applicant_id).toBe('3')

    const payload = form.toPayload()
    expect(payload).toMatchObject({
      room_id: 12,
      responsible: 7,
      applicants: [
        expect.objectContaining({
          tenant_applicant_id: 3,
          negotiation_status_id: 1,
        }),
      ],
    })

    const store = form.toStorePayload()
    expect(store).toMatchObject({
      room_id: 12,
      responsible: 7,
      tenant_applicant_id: 3,
      negotiation_info: 'Звонок',
    })

    form.resetTenantCaseForm()
    expect(form.roomId.value).toBe('')
    expect(form.responsible.value).toBe('')
    expect(form.applicants.value).toHaveLength(1)
    expect(form.applicantsError.value).toBeNull()
  })

  it('applyServerFieldErrors maps room and nested applicant paths', async () => {
    const form = mountForm()

    form.applyServerFieldErrors({
      room_id: 'Нет помещения',
      responsible: null,
      tenant_applicant_id: 'Нет претендента',
      first_contact_date: null,
      negotiation_date: null,
      negotiation_info: null,
      negotiation_status_id: 'Нет статуса',
      applicants: 'Проверьте претендентов',
    })
    await nextTick()

    expect(form.getFieldError('room_id')).toBe('Нет помещения')
    expect(form.getFieldError('applicants[0].tenant_applicant_id')).toBe('Нет претендента')
    expect(form.getFieldError('applicants[0].negotiation_status_id')).toBe('Нет статуса')
    expect(form.applicantsError.value).toBe('Проверьте претендентов')
  })
})
