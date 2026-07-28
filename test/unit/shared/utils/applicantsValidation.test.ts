import { describe, expect, it } from 'vitest'
import {
  createEmptyApplicantContact,
  emptyApplicantCreateFieldErrors,
  hasApplicantCreateFieldErrors,
  normalizeApplicantContact,
  normalizeApplicantCreatePayload,
  parseApplicantCreateFieldErrors,
  validateApplicantContactEmails,
  validateApplicantContactPhones,
  validateApplicantFormPayload,
} from '#shared/utils/applicantsValidation'
import { APPLICANT_REQUIRED_TITLE_MESSAGE } from '#shared/utils/applicantsSchema'

describe('applicantsValidation', () => {
  it('drops empty contacts and trims payload', () => {
    expect(normalizeApplicantContact(createEmptyApplicantContact())).toBeNull()

    const payload = normalizeApplicantCreatePayload({
      title: '  Brand  ',
      category_id: 1,
      company_group: '  ',
      legal_entity_ids: [5],
      contacts: [
        createEmptyApplicantContact(),
        {
          name: '  Ivan  ',
          position: null,
          phone_number: '89991234567',
          email: '  a@b.ru  ',
        },
      ],
    })

    expect(payload.title).toBe('Brand')
    expect(payload.company_group).toBeNull()
    expect(payload.contacts).toHaveLength(1)
    expect(payload.contacts?.[0]?.name).toBe('Ivan')
    expect(payload.contacts?.[0]?.phone_number).toContain('+7')
    expect(payload.contacts?.[0]?.email).toBe('a@b.ru')
  })

  it('maps 422 nested contact errors', () => {
    const errors = parseApplicantCreateFieldErrors({
      errors: {
        title: ['bad title'],
        'contacts.0.email': ['bad email'],
        'contacts[1].phone_number': ['bad phone'],
      },
    })

    expect(errors.title).toBe('bad title')
    expect(errors.contact_emails[0]).toBe('bad email')
    expect(errors.contact_phones[1]).toBe('bad phone')
    expect(parseApplicantCreateFieldErrors({})).toEqual(emptyApplicantCreateFieldErrors())
  })

  it('validates form and contact email/phone helpers', () => {
    const invalid = validateApplicantFormPayload({
      title: '',
      category_id: 0,
      company_group: null,
      legal_entity_ids: null,
      contacts: null,
    })
    expect(invalid.title).toBe(APPLICANT_REQUIRED_TITLE_MESSAGE)
    expect(hasApplicantCreateFieldErrors(invalid)).toBe(true)

    expect(
      validateApplicantContactEmails([
        { name: null, position: null, phone_number: null, email: 'bad' },
      ])[0],
    ).toBeTruthy()
    expect(
      validateApplicantContactEmails([
        { name: null, position: null, phone_number: null, email: 'ok@mail.ru' },
      ])[0],
    ).toBeNull()
    expect(
      validateApplicantContactPhones([
        { name: null, position: null, phone_number: '123', email: null },
      ])[0],
    ).toBeTruthy()
    expect(
      validateApplicantContactPhones([
        { name: null, position: null, phone_number: '+7 (999) 123 - 45 - 67', email: null },
      ])[0],
    ).toBeNull()
  })
})
