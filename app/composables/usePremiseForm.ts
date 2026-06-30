import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import type {
  Premise,
  PremiseCreateFieldErrors,
  PremiseCreatePayload,
} from '#shared/types/premises'
import { premiseFormSchema } from '#shared/utils/premisesSchema'
import {
  normalizePremiseFormValues,
  PREMISE_FORM_FIELD_KEYS,
} from '#shared/utils/premisesValidation'

const FORM_FIELD_KEYS = PREMISE_FORM_FIELD_KEYS

export interface PremiseFormInitialValues {
  room_type_id: string
  name: string
  floor: string
  area: string
  name_bti: string
  floor_bti: string
  area_bti: string
}

const EMPTY_FORM_VALUES: PremiseFormInitialValues = {
  room_type_id: '',
  name: '',
  floor: '',
  area: '',
  name_bti: '',
  floor_bti: '',
  area_bti: '',
}

export function premiseToFormValues(premise: Premise): PremiseFormInitialValues {
  return {
    room_type_id: String(premise.room_type_id),
    name: premise.name,
    floor: premise.floor ?? '',
    area: premise.area === null ? '' : String(premise.area),
    name_bti: premise.name_bti ?? '',
    floor_bti: premise.floor_bti ?? '',
    area_bti: premise.area_bti === null ? '' : String(premise.area_bti),
  }
}

export function usePremiseForm(initialValues: PremiseFormInitialValues = EMPTY_FORM_VALUES) {
  const form = useForm({
    validationSchema: toTypedSchema(premiseFormSchema),
    initialValues: { ...initialValues },
  })

  const [roomTypeId, roomTypeIdAttrs] = form.defineField('room_type_id')
  const [name, nameAttrs] = form.defineField('name')
  const [floor, floorAttrs] = form.defineField('floor')
  const [area, areaAttrs] = form.defineField('area')
  const [nameBti, nameBtiAttrs] = form.defineField('name_bti')
  const [floorBti, floorBtiAttrs] = form.defineField('floor_bti')
  const [areaBti, areaBtiAttrs] = form.defineField('area_bti')

  function applyServerFieldErrors(fieldErrors: PremiseCreateFieldErrors) {
    for (const field of FORM_FIELD_KEYS) {
      const message = fieldErrors[field]
      if (message) {
        form.setFieldError(field, message)
      }
    }
  }

  function toPayload(): PremiseCreatePayload {
    return normalizePremiseFormValues({
      room_type_id: form.values.room_type_id ?? '',
      name: form.values.name ?? '',
      floor: form.values.floor ?? '',
      area: form.values.area ?? '',
      name_bti: form.values.name_bti ?? '',
      floor_bti: form.values.floor_bti ?? '',
      area_bti: form.values.area_bti ?? '',
    })
  }

  return {
    ...form,
    roomTypeId,
    roomTypeIdAttrs,
    name,
    nameAttrs,
    floor,
    floorAttrs,
    area,
    areaAttrs,
    nameBti,
    nameBtiAttrs,
    floorBti,
    floorBtiAttrs,
    areaBti,
    areaBtiAttrs,
    applyServerFieldErrors,
    toPayload,
  }
}
