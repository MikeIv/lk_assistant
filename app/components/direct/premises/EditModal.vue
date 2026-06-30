<script setup lang="ts">
import type { UiSelectOption } from '#shared/types/tenantData'
import type {
  Premise,
  PremiseCreatePayload,
  PremiseCreateResult,
  PremiseDeleteResult,
  RoomType,
} from '#shared/types/premises'
import { premiseToFormValues } from '~/composables/usePremiseForm'

const props = defineProps<{
  premise: Premise | null
  roomTypes: RoomType[]
  submitFn: (id: number, payload: PremiseCreatePayload) => Promise<PremiseCreateResult>
  deleteFn: (id: number) => Promise<PremiseDeleteResult>
}>()

const open = defineModel<boolean>('open', { required: true })

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDeleteConfirmOpen = ref(false)

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

watch(
  () => [open.value, props.premise] as const,
  ([isOpen, premise]) => {
    if (isOpen && premise) {
      resetForm({
        values: premiseToFormValues(premise),
      })
      generalError.value = null
      isDeleteConfirmOpen.value = false
    }
  },
)

function close() {
  open.value = false
}

const onSubmit = handleSubmit(async () => {
  if (!props.premise) {
    return
  }

  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await props.submitFn(props.premise.id, toPayload())

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

async function handleDeleteConfirm() {
  if (!props.premise) {
    return
  }

  generalError.value = null
  isDeleting.value = true

  try {
    const result = await props.deleteFn(props.premise.id)

    if (result.ok) {
      close()
      return
    }

    generalError.value = result.generalError
    isDeleteConfirmOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

const isBusy = computed(() => isSubmitting.value || isDeleting.value)
</script>

<template>
  <Teleport to="body">
    <div v-if="open && premise" :class="$style.overlay" @mousedown.self="close">
      <form
        :class="$style.dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="premises-edit-title"
        @submit.prevent="onSubmit"
      >
        <div :class="$style.header">
          <h3 id="premises-edit-title" :class="$style.title">Редактирование помещения</h3>
          <button
            type="button"
            :class="$style.closeButton"
            aria-label="Закрыть"
            :disabled="isBusy"
            @click="close"
          >
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
                :disabled="isBusy"
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
                :disabled="isBusy"
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
                :disabled="isBusy"
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
                :disabled="isBusy"
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
                :disabled="isBusy"
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
                :disabled="isBusy"
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
                :disabled="isBusy"
              />
            </div>
            <p v-if="errors.area_bti" :class="$style.fieldError">{{ errors.area_bti }}</p>
          </label>
        </fieldset>

        <div v-if="isDeleteConfirmOpen" :class="$style.deleteConfirm">
          <p :class="$style.deleteConfirmText">Удалить помещение «{{ premise.name }}»?</p>
          <div :class="$style.deleteConfirmActions">
            <UiButton
              type="button"
              size="sm"
              variant="warning"
              label="Удалить"
              :loading="isDeleting"
              :disabled="isBusy"
              @click="handleDeleteConfirm"
            />
            <UiButton
              type="button"
              size="sm"
              variant="soft"
              label="Отмена"
              :disabled="isBusy"
              @click="isDeleteConfirmOpen = false"
            />
          </div>
        </div>

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

        <div :class="$style.actions">
          <UiButton
            type="submit"
            size="sm"
            variant="success"
            label="Сохранить"
            :loading="isSubmitting"
            :disabled="isBusy"
          />
          <UiButton
            type="button"
            size="sm"
            variant="soft"
            label="Отменить"
            :disabled="isBusy"
            @click="close"
          />
          <UiButton
            v-if="!isDeleteConfirmOpen"
            type="button"
            size="sm"
            variant="warning"
            label="Удалить"
            :disabled="isBusy"
            @click="isDeleteConfirmOpen = true"
          />
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fs-space-2);
  background: rgb(23 23 32 / 0.45);
}

.dialog {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: min(100%, rem(520));
  max-height: min(92vh, rem(760));
  padding: var(--fs-space-3);
  overflow: auto;
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fs-space-2);
}

.title {
  margin: 0;

  @include typo.fs-text-h4;
}

.closeButton {
  flex-shrink: 0;
  width: rem(32);
  height: rem(32);
  margin: 0;
  padding: 0;
  border: none;
  border-radius: rem(8);
  font-size: rem(24);
  line-height: 1;
  color: var(--fs-color-text-muted);
  background: transparent;
  cursor: pointer;

  &:hover {
    color: var(--fs-color-text);
    background-color: var(--fs-figma-achromatic-light-gray);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  margin: 0;
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(12);
}

.sectionTitle {
  padding: 0 var(--fs-space-1);
  font-size: rem(13);
  font-weight: 700;
  color: var(--fs-color-text);
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.label {
  font-size: rem(13);
  font-weight: 600;
  color: var(--fs-color-text);
}

.required {
  color: var(--fs-color-error);
}

.inputWrap {
  border-radius: rem(12);
  transition: box-shadow 0.16s ease;
}

.inputWrapError {
  animation: premises-field-error-blink 1.2s ease-in-out 2;
  box-shadow: 0 0 0 2px var(--fs-color-error);
}

.fieldError {
  margin: 0;
  font-size: rem(12);
  color: var(--fs-color-error);
}

.deleteConfirm {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  padding: var(--fs-space-2);
  border-radius: rem(12);
  background-color: var(--fs-color-ui-button-warning-surface);
}

.deleteConfirmText {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-text);
}

.deleteConfirmActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}

.generalError {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-error);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  margin-top: var(--fs-space-1);
}

@keyframes premises-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
