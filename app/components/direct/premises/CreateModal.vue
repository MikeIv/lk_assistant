<script setup lang="ts">
import type { UiSelectOption } from '#shared/types/tenantData'
import type { PremiseCreatePayload, PremiseCreateResult, RoomType } from '#shared/types/premises'

const props = defineProps<{
  roomTypes: RoomType[]
  submitFn: (payload: PremiseCreatePayload) => Promise<PremiseCreateResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)

const {
  handleSubmit,
  errors,
  resetForm,
  applyServerFieldErrors,
  toPayload,
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
} = usePremiseForm()

const roomTypeOptions = computed<UiSelectOption[]>(() =>
  props.roomTypes.map((item) => ({
    value: String(item.id),
    label: item.name,
    outputValue: String(item.id),
  })),
)

watch(open, (isOpen) => {
  if (isOpen) {
    resetForm({
      values: {
        room_type_id: '',
        name: '',
        floor: '',
        area: '',
        name_bti: '',
        floor_bti: '',
        area_bti: '',
      },
    })
    generalError.value = null
  }
})

function close() {
  open.value = false
}

const onSubmit = handleSubmit(async () => {
  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn(toPayload())

    if (result.ok) {
      close()
      return
    }

    applyServerFieldErrors(result.fieldErrors)
    generalError.value = result.generalError
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premises-create-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="premises-create-title" :class="$style.title">Создание помещения</h3>
          <button type="button" :class="$style.closeButton" aria-label="Закрыть" @click="close">
            ×
          </button>
        </div>

        <fieldset :class="$style.section">
          <legend :class="$style.sectionTitle">Аренда</legend>

          <label :class="$style.field">
            <span :class="$style.label">
              Тип помещения
              <span :class="$style.required">*</span>
            </span>
            <div :class="[$style.inputWrap, errors.room_type_id && $style.inputWrapError]">
              <UiSelect
                v-model="roomTypeId"
                v-bind="roomTypeIdAttrs"
                :options="roomTypeOptions"
                placeholder="Выберите тип"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.room_type_id" :class="$style.fieldError">{{ errors.room_type_id }}</p>
          </label>

          <label :class="$style.field">
            <span :class="$style.label">
              Номер помещения
              <span :class="$style.required">*</span>
            </span>
            <div :class="[$style.inputWrap, errors.name && $style.inputWrapError]">
              <UiInput
                v-model="name"
                v-bind="nameAttrs"
                placeholder="Введите номер"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.name" :class="$style.fieldError">{{ errors.name }}</p>
          </label>

          <label :class="$style.field">
            <span :class="$style.label">Этаж</span>
            <div :class="[$style.inputWrap, errors.floor && $style.inputWrapError]">
              <UiInput
                v-model="floor"
                v-bind="floorAttrs"
                placeholder="Введите этаж"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.floor" :class="$style.fieldError">{{ errors.floor }}</p>
          </label>

          <label :class="$style.field">
            <span :class="$style.label">Расчётная площадь, м²</span>
            <div :class="[$style.inputWrap, errors.area && $style.inputWrapError]">
              <UiInput
                v-model="area"
                v-bind="areaAttrs"
                placeholder="Введите площадь"
                inputmode="decimal"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.area" :class="$style.fieldError">{{ errors.area }}</p>
          </label>
        </fieldset>

        <fieldset :class="$style.section">
          <legend :class="$style.sectionTitle">БТИ</legend>

          <label :class="$style.field">
            <span :class="$style.label">Номер по БТИ</span>
            <div :class="[$style.inputWrap, errors.name_bti && $style.inputWrapError]">
              <UiInput
                v-model="nameBti"
                v-bind="nameBtiAttrs"
                placeholder="Введите номер"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.name_bti" :class="$style.fieldError">{{ errors.name_bti }}</p>
          </label>

          <label :class="$style.field">
            <span :class="$style.label">Этаж по БТИ</span>
            <div :class="[$style.inputWrap, errors.floor_bti && $style.inputWrapError]">
              <UiInput
                v-model="floorBti"
                v-bind="floorBtiAttrs"
                placeholder="Введите этаж"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.floor_bti" :class="$style.fieldError">{{ errors.floor_bti }}</p>
          </label>

          <label :class="$style.field">
            <span :class="$style.label">Площадь по БТИ, м²</span>
            <div :class="[$style.inputWrap, errors.area_bti && $style.inputWrapError]">
              <UiInput
                v-model="areaBti"
                v-bind="areaBtiAttrs"
                placeholder="Введите площадь"
                inputmode="decimal"
                :disabled="isSubmitting"
              />
            </div>
            <p v-if="errors.area_bti" :class="$style.fieldError">{{ errors.area_bti }}</p>
          </label>
        </fieldset>

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

        <div :class="$style.actions">
          <UiButton
            type="submit"
            size="sm"
            variant="success"
            label="Создать"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
          <UiButton
            type="button"
            size="sm"
            variant="soft"
            label="Отменить"
            :disabled="isSubmitting"
            @click="close"
          />
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style module lang="scss" src="./premisesModal.module.scss"></style>
