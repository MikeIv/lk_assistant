<script setup lang="ts">
import type { TenantCase } from '#shared/types/tenantCases'
import { tenantCaseApplicantsToFormLoad } from '#shared/utils/tenantCasesNormalize'
import type { TenantCaseCardTab } from '~/components/broker/current/CaseTabs.vue'

const route = useRoute()
const caseId = computed(() => Number(route.params.id))

const { fetchTenantCase, updateTenantCase, deleteTenantCase } = useTenantCases()
const { applicants: directoryApplicants, isLoading: isOptionsLoading } = useTenantCaseFormOptions()

const tenantCase = ref<TenantCase | null>(null)
const loadError = ref<string | null>(null)
const isLoading = ref(true)
const generalError = ref<string | null>(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const isDeleteConfirmOpen = ref(false)
const isCancelling = ref(false)
const activeTab = ref<TenantCaseCardTab>('room')

const applicantsTabRef = ref<{ resetCollapseForTabEnter: () => void } | null>(null)

const {
  handleSubmit,
  loadTenantCaseForm,
  applyServerFieldErrors,
  getFieldError,
  addApplicant,
  removeApplicant,
  addNegotiation,
  removeNegotiation,
  toPayload,
  applicants: formApplicants,
} = useTenantCaseForm()

const isBusy = computed(() => isSubmitting.value || isDeleting.value || isCancelling.value)

function applyCaseToForm(item: TenantCase) {
  tenantCase.value = item
  loadTenantCaseForm(
    {
      room_id: String(item.room_id),
      responsible_name: item.responsible ?? '',
    },
    tenantCaseApplicantsToFormLoad(item.applicants),
  )
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

const onSubmit = handleSubmit(async () => {
  if (!tenantCase.value) {
    return
  }

  generalError.value = null
  isSubmitting.value = true

  try {
    const result = await updateTenantCase(tenantCase.value.id, toPayload())

    if (result.ok) {
      await navigateTo('/broker/current')
      return
    }

    applyServerFieldErrors(result.fieldErrors)
    generalError.value = result.generalError
    activeTab.value = 'applicants'
  } finally {
    isSubmitting.value = false
  }
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
      await navigateTo('/broker/current')
      return
    }

    generalError.value = result.generalError
    isDeleteConfirmOpen.value = false
  } finally {
    isDeleting.value = false
  }
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
      <NuxtLink to="/broker/current" :class="$style.backLink">← К списку дел</NuxtLink>
    </div>

    <div v-if="isLoading" :class="$style.state">Загрузка карточки дела…</div>

    <div v-else-if="loadError" :class="$style.stateError">
      {{ loadError }}
      <NuxtLink to="/broker/current" :class="$style.backLink">Вернуться к списку</NuxtLink>
    </div>

    <form v-else-if="tenantCase" :class="$style.form" @submit.prevent="onSubmit">
      <header :class="$style.header">
        <h3 :class="$style.title">Дело №{{ tenantCase.id }}</h3>
      </header>

      <BrokerCurrentCaseTabs v-model="activeTab" />

      <div v-if="isOptionsLoading && activeTab === 'applicants'" :class="$style.state">
        Загрузка справочников…
      </div>

      <BrokerCurrentCaseRoomTab v-else-if="activeTab === 'room'" :room="tenantCase.room" />

      <BrokerCurrentCaseApplicantsTab
        v-else-if="activeTab === 'applicants'"
        ref="applicantsTabRef"
        v-model:applicants="formApplicants"
        :directory-applicants="directoryApplicants"
        :disabled="isBusy"
        :get-field-error="getFieldError"
        @add="addApplicant"
        @remove="removeApplicant"
        @add-negotiation="addNegotiation"
        @remove-negotiation="removeNegotiation"
      />

      <BrokerCurrentCaseKpTab v-else-if="activeTab === 'kp'" />

      <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

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

    <Teleport to="body">
      <div
        v-if="isDeleteConfirmOpen"
        :class="$style.overlay"
        @mousedown.self="isDeleteConfirmOpen = false"
      >
        <div :class="$style.confirmDialog" role="dialog" aria-modal="true">
          <h4 :class="$style.confirmTitle">Удалить дело?</h4>
          <p :class="$style.confirmText">Действие нельзя отменить.</p>
          <div :class="$style.confirmActions">
            <UiButton
              type="button"
              size="sm"
              variant="warning"
              label="Удалить"
              :loading="isDeleting"
              :disabled="isDeleting"
              @click="handleDeleteConfirm"
            />
            <UiButton
              type="button"
              size="sm"
              variant="soft"
              label="Отменить"
              :disabled="isDeleting"
              @click="isDeleteConfirmOpen = false"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: 100%;
}

.topBar {
  display: flex;
  align-items: center;
}

.backLink {
  font-size: rem(14);
  color: var(--fs-color-primary);
  text-decoration: underline;
  text-underline-offset: rem(2);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  padding: var(--fs-space-3);
  border-radius: rem(20);
  background-color: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.header {
  display: flex;
  align-items: flex-start;
}

.title {
  margin: 0;

  @include typo.fs-text-h3;
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
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
}

.actionsLeft {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}

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

.confirmDialog {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  width: min(100%, rem(420));
  padding: var(--fs-space-3);
  border-radius: rem(16);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-cabinet-nav);
}

.confirmTitle {
  margin: 0;

  @include typo.fs-text-h4;
}

.confirmText {
  margin: 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
}

.confirmActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}
</style>
