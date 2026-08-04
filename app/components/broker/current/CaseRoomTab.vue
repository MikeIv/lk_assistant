<script setup lang="ts">
import type { TenantCaseRoom } from '#shared/types/tenantCases'
import type { UiSelectOption } from '#shared/types/tenantData'
import {
  formatTenantCaseArea,
  mapTenantCaseResponsiblesToSelectOptions,
} from '#shared/utils/tenantCasesNormalize'

const props = defineProps<{
  room: TenantCaseRoom | null
  roomId: number | string
  caseId: number
  responsibleLabel?: string | null
  disabled?: boolean
  error?: string
}>()

const responsible = defineModel<string>('responsible', { required: true })

const {
  items: responsibleItems,
  isLoading: isResponsiblesLoading,
  fetchResponsibles,
} = useTenantCaseResponsibles()

const title = computed(() => {
  const name = props.room?.name?.trim()
  return name ? `Помещение ${name}` : 'Помещение'
})

const parameters = computed(() => [
  { label: 'Номер помещения', value: props.room?.name?.trim() || '—' },
  { label: 'Тип помещения', value: props.room?.category?.trim() || '—' },
  { label: 'Этаж', value: props.room?.floor?.trim() || '—' },
  { label: 'Площадь, м²', value: formatTenantCaseArea(props.room?.area ?? null) },
])

const responsibleOptions = computed<UiSelectOption[]>(() => {
  const options = mapTenantCaseResponsiblesToSelectOptions(responsibleItems.value)
  const selectedId = responsible.value.trim()
  const selectedLabel = props.responsibleLabel?.trim()

  if (
    selectedId &&
    selectedLabel &&
    !options.some((option) => option.outputValue === selectedId)
  ) {
    return [
      {
        value: selectedId,
        label: selectedLabel,
        outputValue: selectedId,
      },
      ...options,
    ]
  }

  return options
})

async function onResponsibleOpen() {
  if (props.disabled) {
    return
  }

  await fetchResponsibles({
    roomId: props.roomId,
    tenantCaseId: props.caseId,
  })
}
</script>

<template>
  <article :class="$style.root" role="tabpanel" :aria-label="title">
    <!-- Временно скрыт по запросу заказчика; aria-label на article сохраняет доступность. -->
    <h3 :class="$style.title">{{ title }}</h3>

    <div :class="$style.table">
      <BrokerCurrentCaseTableRow
        v-for="parameter in parameters"
        :key="parameter.label"
        :label="parameter.label"
      >
        <span :class="$style.value">{{ parameter.value }}</span>
      </BrokerCurrentCaseTableRow>

      <BrokerCurrentCaseTableRow label="Ответственный" required>
        <div :class="[$style.selectWrap, error && $style.selectWrapError]">
          <UiSelect
            v-model="responsible"
            :options="responsibleOptions"
            placeholder="Выберите ответственного"
            searchable
            :disabled="disabled"
            @open="onResponsibleOpen"
          />
        </div>
        <p v-if="error" :class="$style.fieldError">{{ error }}</p>
        <p v-else-if="isResponsiblesLoading" :class="$style.hint">Загрузка ответственных…</p>
      </BrokerCurrentCaseTableRow>
    </div>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/ui-kit-card' as card;

.root {
  @include card.content-card;
  background-color: var(--fs-figma-achromatic-light-gray);
}

.title {
  @include card.content-card-title;
  display: none;
}

.table {
  display: grid;
  grid-template-columns: max-content minmax(0, rem(420));
  align-items: center;
  column-gap: rem(24);
  row-gap: var(--fs-space-1);
  width: fit-content;
  max-width: 100%;
}

.value {
  display: block;
  width: 100%;
  font-size: rem(14);
  line-height: 1.4;
  font-weight: 600;
  color: var(--fs-figma-achromatic-black);
  text-align: right;
}

.selectWrap {
  width: 100%;
  border-radius: rem(12);
  transition: box-shadow 0.16s ease;
}

.selectWrapError {
  animation: tenant-case-field-error-blink 1.2s ease-in-out 2;
  box-shadow: 0 0 0 2px var(--fs-color-error);
}

.fieldError {
  margin: rem(6) 0 0;
  font-size: rem(12);
  color: var(--fs-color-error);
  text-align: left;
}

.hint {
  margin: rem(6) 0 0;
  font-size: rem(12);
  color: var(--fs-color-text-muted);
  text-align: left;
}

@keyframes tenant-case-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
