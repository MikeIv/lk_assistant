<script setup lang="ts">
import type { TenantCase } from '#shared/types/tenantCases'
import { tenantCaseApplicantsToFormLoad } from '#shared/utils/tenantCasesNormalize'
import type { TenantCaseCardTab } from '~/components/broker/current/CaseTabs.vue'

const CASES_LIST_PATH = '/broker/current'

const route = useRoute()
const caseId = computed(() => Number(route.params.id))

const { fetchTenantCase, updateTenantCase, deleteTenantCase } = useTenantCases()
const { applicants: directoryApplicants, negotiationStatuses, isLoading: isOptionsLoading } =
  useTenantCaseFormOptions()

const tenantCase = ref<TenantCase | null>(null)
const loadError = ref<string | null>(null)
const isLoading = ref(true)
const generalError = ref<string | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDeleteConfirmOpen = ref(false)
const isLeaveConfirmOpen = ref(false)
const isCancelling = ref(false)
const activeTab = ref<TenantCaseCardTab>('room')
const pristinePayloadJson = ref<string | null>(null)

const applicantsTabRef = ref<{
  resetCollapseForTabEnter: () => void
  expandApplicantsWithErrors: (getFieldError: (path: string) => string | undefined) => void
} | null>(null)

const {
  handleSubmit,
  loadTenantCaseForm,
  applyMutationFieldErrors,
  getFieldError,
  addApplicant,
  removeApplicant,
  addNegotiation,
  removeNegotiation,
  toPayload,
  applicants: formApplicants,
} = useTenantCaseForm()

const isBusy = computed(() => isSubmitting.value || isDeleting.value || isCancelling.value)

const hasUnsavedChanges = computed(() => {
  if (pristinePayloadJson.value == null || !tenantCase.value) {
    return false
  }

  return JSON.stringify(toPayload()) !== pristinePayloadJson.value
})

function rememberPristinePayload() {
  pristinePayloadJson.value = JSON.stringify(toPayload())
}

function applyCaseToForm(item: TenantCase) {
  tenantCase.value = item
  loadTenantCaseForm(
    {
      room_id: String(item.room_id),
      responsible_name: item.responsible ?? '',
    },
    tenantCaseApplicantsToFormLoad(item.applicants),
  )
  rememberPristinePayload()
}

async function loadCase() {
  if (!Number.isFinite(caseId.value) || caseId.value <= 0) {
    loadError.value = 'Некорректный идентификатор дела'
    tenantCase.value = null
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = null

  const item = await fetchTenantCase(caseId.value)

  if (!item) {
    loadError.value = 'Карточка дела не найдена'
    tenantCase.value = null
    isLoading.value = false
    return
  }

  applyCaseToForm(item)
  isLoading.value = false
}

watch(caseId, () => {
  activeTab.value = 'room'
  void loadCase()
}, { immediate: true })

watch(activeTab, (tab) => {
  if (tab !== 'applicants') {
    return
  }

  void nextTick(() => {
    applicantsTabRef.value?.resetCollapseForTabEnter()
  })
})

async function focusApplicantsValidation() {
  activeTab.value = 'applicants'
  await nextTick()
  applicantsTabRef.value?.expandApplicantsWithErrors(getFieldError)
}

const onSubmit = handleSubmit(async () => {
  if (!tenantCase.value) {
    return
  }

  generalError.value = null
  isSubmitting.value = true

  try {
    const payload = toPayload()
    const result = await updateTenantCase(tenantCase.value.id, payload)

    if (result.ok) {
      const item = await fetchTenantCase(tenantCase.value.id)

      if (item) {
        applyCaseToForm(item)
        activeTab.value = 'applicants'
        await nextTick()
        applicantsTabRef.value?.resetCollapseForTabEnter()
      }

      return
    }

    applyMutationFieldErrors(result.fieldErrors, payload)
    generalError.value = result.generalError
    await focusApplicantsValidation()
  } finally {
    isSubmitting.value = false
  }
}, {
  onInvalid: focusApplicantsValidation,
})

async function handleCancel() {
  if (!tenantCase.value) {
    return
  }

  isCancelling.value = true
  generalError.value = null

  try {
    const item = await fetchTenantCase(tenantCase.value.id)

    if (!item) {
      generalError.value = 'Не удалось сбросить данные карточки'
      return
    }

    applyCaseToForm(item)

    if (activeTab.value === 'applicants') {
      await nextTick()
      applicantsTabRef.value?.resetCollapseForTabEnter()
    }
  } finally {
    isCancelling.value = false
  }
}

async function handleDeleteConfirm() {
  if (!tenantCase.value) {
    return
  }

  isDeleting.value = true
  generalError.value = null

  try {
    const result = await deleteTenantCase(tenantCase.value.id)

    if (result.ok) {
      await goToCasesList()
      return
    }

    generalError.value = result.generalError
    isDeleteConfirmOpen.value = false
  } finally {
    isDeleting.value = false
  }
}

function goToCasesList() {
  return navigateTo(CASES_LIST_PATH)
}

function onBackLinkClick() {
  if (hasUnsavedChanges.value) {
    isLeaveConfirmOpen.value = true
    return
  }

  void goToCasesList()
}

function confirmLeaveWithoutSave() {
  isLeaveConfirmOpen.value = false
  void goToCasesList()
}

useHead(
  computed(() => ({
    title: tenantCase.value
      ? `Дело №${tenantCase.value.id} — Текущие дела`
      : 'Карточка дела — Текущие дела',
  })),
)
</script>

<template>
  <section :class="$style.root">
    <div :class="$style.topBar">
      <a
        :href="CASES_LIST_PATH"
        :class="$style.backLink"
        @click.prevent="onBackLinkClick"
      >
        ← К списку дел
      </a>
    </div>

    <div v-if="isLoading" :class="$style.state">Загрузка карточки дела…</div>

    <div v-else-if="loadError" :class="$style.stateError">
      {{ loadError }}
      <NuxtLink :to="CASES_LIST_PATH" :class="$style.backLink">Вернуться к списку</NuxtLink>
    </div>

    <form v-else-if="tenantCase" :class="$style.form" @submit.prevent="onSubmit">
      <header :class="$style.header">
        <h3 :class="$style.title">Дело №{{ tenantCase.id }}</h3>
      </header>

      <BrokerCurrentCaseTabs v-model="activeTab" />

      <div :class="$style.tabBody">
        <div v-if="isOptionsLoading && activeTab === 'applicants'" :class="$style.state">
          Загрузка справочников…
        </div>

        <BrokerCurrentCaseRoomTab v-else-if="activeTab === 'room'" :room="tenantCase.room" />

        <BrokerCurrentCaseApplicantsTab
          v-else-if="activeTab === 'applicants'"
          ref="applicantsTabRef"
          v-model:applicants="formApplicants"
          :directory-applicants="directoryApplicants"
          :negotiation-statuses="negotiationStatuses"
          :disabled="isBusy"
          :get-field-error="getFieldError"
          @add="addApplicant"
          @remove="removeApplicant"
          @add-negotiation="addNegotiation"
          @remove-negotiation="removeNegotiation"
        />

        <BrokerCurrentCaseKpTab v-else-if="activeTab === 'kp'" />

        <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>
      </div>

      <div :class="$style.actions">
        <div :class="$style.actionsLeft">
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
            variant="outline"
            label="Отменить"
            :loading="isCancelling"
            :disabled="isBusy"
            @click="handleCancel"
          />
        </div>
        <UiButton
          type="button"
          size="sm"
          variant="warning"
          label="Удалить дело"
          :disabled="isBusy"
          @click="isDeleteConfirmOpen = true"
        />
      </div>
    </form>

    <UiConfirmPopup
      v-model="isDeleteConfirmOpen"
      message="Вы пытаетесь удалить дело"
      confirm-label="Удалить"
      cancel-label="Не удалять"
      confirm-variant="warning"
      button-size="sm"
      :loading="isDeleting"
      @confirm="handleDeleteConfirm"
    />

    <UiConfirmPopup
      v-model="isLeaveConfirmOpen"
      message="Вы не сохранили изменения"
      confirm-label="Не сохранять"
      cancel-label="Вернуться"
      confirm-variant="warning"
      button-size="sm"
      @confirm="confirmLeaveWithoutSave"
    />
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.topBar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.backLink {
  font-size: rem(14);
  color: var(--fs-color-primary);
  text-decoration: underline;
  text-underline-offset: rem(2);
  cursor: pointer;
}

.form {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fs-space-2);
  min-height: 0;
  padding: var(--fs-space-3);
  border-radius: rem(20);
  background-color: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.header {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
}

.title {
  margin: 0;

  @include typo.fs-text-h3;
}

.tabBody {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
}

.state {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}

.stateError {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  margin: 0;
  padding: var(--fs-space-2);
  border-radius: rem(12);
  color: #b42318;
  background-color: rgb(180 35 24 / 0.08);

  @include typo.fs-text-body;
}

.generalError {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-error);
}

.actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
  margin-top: auto;
}

.actionsLeft {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}
</style>
