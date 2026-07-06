<script setup lang="ts">
import type { TenantCase } from '#shared/types/tenantCases'
import { tenantCaseToCreatePayload } from '#shared/utils/tenantCasesNormalize'

const route = useRoute()
const caseId = computed(() => Number(route.params.id))

const { fetchTenantCase, updateTenantCase, deleteTenantCase } = useTenantCases()
const { rooms, applicants, isLoading: isOptionsLoading } = useTenantCaseFormOptions()

const tenantCase = ref<TenantCase | null>(null)
const loadError = ref<string | null>(null)
const isLoading = ref(true)
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
  roomId,
  responsibleName,
  applicants: formApplicants,
  setApplicantsFromPayload,
  addApplicant,
  removeApplicant,
  addNegotiation,
  removeNegotiation,
} = useTenantCaseForm()

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

  tenantCase.value = item

  const payload = tenantCaseToCreatePayload(item)
  resetForm({
    values: {
      room_id: String(payload.room_id),
      responsible_name: payload.responsible_name ?? '',
      applicants: [],
    },
  })
  setApplicantsFromPayload(payload.applicants)
  isLoading.value = false
}

watch(caseId, () => {
  void loadCase()
}, { immediate: true })

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
  } finally {
    isSubmitting.value = false
  }
})

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
    title:
      tenantCase.value?.room?.name != null
        ? `Дело ${tenantCase.value.room.name} — Текущие дела`
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
        <div>
          <h3 :class="$style.title">Карточка дела №{{ tenantCase.id }}</h3>
          <p v-if="tenantCase.current_tenant" :class="$style.subtitle">
            Текущий арендатор: {{ tenantCase.current_tenant }}
          </p>
        </div>
      </header>

      <div v-if="isOptionsLoading" :class="$style.state">Загрузка справочников…</div>

      <BrokerCurrentFormFields
        v-else
        v-model:room-id="roomId"
        v-model:responsible-name="responsibleName"
        v-model:applicants="formApplicants"
        :rooms="rooms"
        :directory-applicants="applicants"
        :errors="errors"
        :disabled="isSubmitting || isDeleting"
        @add-applicant="addApplicant"
        @remove-applicant="removeApplicant"
        @add-negotiation="addNegotiation"
        @remove-negotiation="removeNegotiation"
      />

      <p v-if="generalError" :class="$style.generalError">{{ generalError }}</p>

      <div :class="$style.actions">
        <UiButton
          type="submit"
          size="sm"
          variant="success"
          label="Сохранить"
          :loading="isSubmitting"
          :disabled="isSubmitting || isDeleting || isOptionsLoading"
        />
        <UiButton
          type="button"
          size="sm"
          variant="soft"
          label="Удалить"
          :disabled="isSubmitting || isDeleting"
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
          <h4 :class="$style.confirmTitle">Удалить карточку дела?</h4>
          <p :class="$style.confirmText">Действие нельзя отменить.</p>
          <div :class="$style.confirmActions">
            <UiButton
              type="button"
              size="sm"
              variant="primary"
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
  justify-content: space-between;
  gap: var(--fs-space-2);
}

.title {
  margin: 0;

  @include typo.fs-text-h3;
}

.subtitle {
  margin: rem(6) 0 0;
  color: var(--fs-color-text-muted);

  @include typo.fs-text-body;
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
