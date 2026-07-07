<script setup lang="ts">
import type { ApplicantContact } from '#shared/types/applicants'
import type { Category } from '#shared/types/categories'
import type { LegalEntity } from '#shared/types/legalEntities'
import type { UiSelectOption } from '#shared/types/tenantData'
import { APPLICANTS_MAX_LEGAL_ENTITIES } from '#shared/utils/applicantsTable'
import { createEmptyApplicantContact } from '#shared/utils/applicantsValidation'

const props = defineProps<{
  categories: Category[]
  legalEntities: LegalEntity[]
  titleAttrs: Record<string, unknown>
  categoryIdAttrs: Record<string, unknown>
  companyGroupAttrs: Record<string, unknown>
  errors: {
    title?: string | null
    category_id?: string | null
    company_group?: string | null
    legal_entity_ids?: string | null
    contacts?: string | null
    contact_emails?: (string | null)[]
    contact_phones?: (string | null)[]
  }
  disabled?: boolean
  validateContactEmailOnBlur?: (index: number) => void
  validateContactPhoneOnBlur?: (index: number) => void
}>()

const title = defineModel<string>('title', { required: true })
const categoryId = defineModel<string>('categoryId', { required: true })
const companyGroup = defineModel<string>('companyGroup', { required: true })
const legalEntityIds = defineModel<number[]>('legalEntityIds', { required: true })
const contacts = defineModel<ApplicantContact[]>('contacts', { required: true })

const categoryOptions = computed<UiSelectOption[]>(() =>
  props.categories.map((item) => ({
    value: String(item.id),
    label: item.name,
    outputValue: String(item.id),
  })),
)

const legalEntitySearchQuery = ref('')

function tokenizeSearchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[«»"'.,()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

const filteredLegalEntities = computed(() => {
  const queryWords = tokenizeSearchText(legalEntitySearchQuery.value.trim())

  if (!queryWords.length) {
    return props.legalEntities
  }

  return props.legalEntities.filter((entity) => {
    const nameWords = tokenizeSearchText(entity.legal_entity)

    return queryWords.every((queryWord) =>
      nameWords.some((nameWord) => nameWord.startsWith(queryWord)),
    )
  })
})

function isLegalEntitySelected(id: number): boolean {
  return legalEntityIds.value.includes(id)
}

function toggleLegalEntity(id: number) {
  const next = new Set(legalEntityIds.value)

  if (next.has(id)) {
    next.delete(id)
  } else if (next.size < APPLICANTS_MAX_LEGAL_ENTITIES) {
    next.add(id)
  }

  legalEntityIds.value = [...next]
}

function addContact() {
  contacts.value = [...contacts.value, createEmptyApplicantContact()]
}

function removeContact(index: number) {
  contacts.value = contacts.value.filter((_, contactIndex) => contactIndex !== index)
}

function updateContactField(index: number, field: keyof ApplicantContact, value: string | null) {
  contacts.value = contacts.value.map((contact, contactIndex) =>
    contactIndex === index ? { ...contact, [field]: value } : contact,
  )
}
</script>

<template>
  <div :class="$style.root">
    <label :class="$style.field">
      <span :class="$style.label">
        Бренд / наименование
        <span :class="$style.required">*</span>
      </span>
      <div :class="[$style.inputWrap, errors.title && $style.inputWrapError]">
        <UiInput
          v-model="title"
          v-bind="titleAttrs"
          placeholder="Введите наименование"
          :disabled="disabled"
        />
      </div>
      <p v-if="errors.title" :class="$style.fieldError">{{ errors.title }}</p>
    </label>

    <label :class="$style.field">
      <span :class="$style.label">
        Категория
        <span :class="$style.required">*</span>
      </span>
      <div :class="[$style.inputWrap, errors.category_id && $style.inputWrapError]">
        <UiSelect
          v-model="categoryId"
          v-bind="categoryIdAttrs"
          :options="categoryOptions"
          placeholder="Выберите категорию"
          :disabled="disabled"
        />
      </div>
      <p v-if="errors.category_id" :class="$style.fieldError">{{ errors.category_id }}</p>
    </label>

    <label :class="$style.field">
      <span :class="$style.label">Группа компаний</span>
      <div :class="[$style.inputWrap, errors.company_group && $style.inputWrapError]">
        <UiInput
          v-model="companyGroup"
          v-bind="companyGroupAttrs"
          placeholder="Введите группу компаний"
          :disabled="disabled"
        />
      </div>
      <p v-if="errors.company_group" :class="$style.fieldError">{{ errors.company_group }}</p>
    </label>

    <fieldset :class="$style.section">
      <legend :class="$style.sectionTitle">
        Юридические лица
        <span :class="$style.sectionHint">(не более {{ APPLICANTS_MAX_LEGAL_ENTITIES }})</span>
      </legend>

      <div :class="$style.legalEntitiesBlock">
        <div :class="$style.legalEntitiesSearch">
          <UiInput
            v-model="legalEntitySearchQuery"
            placeholder="Поиск"
            :disabled="disabled"
            aria-label="Поиск юридического лица"
          />
        </div>

        <div :class="$style.legalEntitiesList">
          <label
            v-for="entity in filteredLegalEntities"
            :key="entity.id"
            :class="$style.legalEntityOption"
          >
            <input
              type="checkbox"
              :checked="isLegalEntitySelected(entity.id)"
              :disabled="
                disabled ||
                (!isLegalEntitySelected(entity.id) &&
                  legalEntityIds.length >= APPLICANTS_MAX_LEGAL_ENTITIES)
              "
              @change="toggleLegalEntity(entity.id)"
            />
            <span :class="$style.legalEntityLabel">{{ entity.legal_entity }}</span>
          </label>

          <p v-if="!filteredLegalEntities.length" :class="$style.legalEntitiesEmpty">
            Ничего не найдено
          </p>
        </div>
      </div>

      <p v-if="errors.legal_entity_ids" :class="$style.fieldError">{{ errors.legal_entity_ids }}</p>
    </fieldset>

    <fieldset :class="$style.section">
      <legend :class="$style.sectionTitle">Контакты</legend>

      <div v-if="!contacts.length" :class="$style.emptyContacts">Контакты не добавлены</div>

      <div v-for="(contact, index) in contacts" :key="index" :class="$style.contactCard">
        <div :class="$style.contactHeader">
          <span :class="$style.contactTitle">Контакт {{ index + 1 }}</span>
          <button
            type="button"
            :class="$style.removeContact"
            :disabled="disabled"
            @click="removeContact(index)"
          >
            Удалить
          </button>
        </div>

        <label :class="$style.field">
          <span :class="$style.label">ФИО</span>
          <UiInput
            :model-value="contact.name ?? ''"
            placeholder="Введите ФИО"
            :disabled="disabled"
            @update:model-value="updateContactField(index, 'name', $event || null)"
          />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Должность</span>
          <UiInput
            :model-value="contact.position ?? ''"
            placeholder="Введите должность"
            :disabled="disabled"
            @update:model-value="updateContactField(index, 'position', $event || null)"
          />
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Телефон</span>
          <div
            :class="[$style.inputWrap, errors.contact_phones?.[index] && $style.inputWrapError]"
          >
            <UiPhoneInput
              :model-value="contact.phone_number"
              :disabled="disabled"
              @update:model-value="updateContactField(index, 'phone_number', $event)"
              @blur="validateContactPhoneOnBlur?.(index)"
            />
          </div>
          <p v-if="errors.contact_phones?.[index]" :class="$style.fieldError">
            {{ errors.contact_phones[index] }}
          </p>
        </label>

        <label :class="$style.field">
          <span :class="$style.label">Email</span>
          <div
            :class="[$style.inputWrap, errors.contact_emails?.[index] && $style.inputWrapError]"
          >
            <UiInput
              :model-value="contact.email ?? ''"
              placeholder="Введите email"
              type="email"
              :disabled="disabled"
              @update:model-value="updateContactField(index, 'email', $event || null)"
              @blur="validateContactEmailOnBlur?.(index)"
            />
          </div>
          <p v-if="errors.contact_emails?.[index]" :class="$style.fieldError">
            {{ errors.contact_emails[index] }}
          </p>
        </label>
      </div>

      <UiButton
        type="button"
        size="sm"
        variant="soft"
        label="Добавить контакт"
        :disabled="disabled"
        @click="addContact"
      />

      <p v-if="errors.contacts" :class="$style.fieldError">{{ errors.contacts }}</p>
    </fieldset>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
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
  animation: applicants-field-error-blink 1.2s ease-in-out 2;
  box-shadow: 0 0 0 2px var(--fs-color-error);
}

.fieldError {
  margin: 0;
  font-size: rem(12);
  color: var(--fs-color-error);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  margin: 0;
  padding: 0;
  border: none;
}

.sectionTitle {
  font-size: rem(13);
  font-weight: 700;
  color: var(--fs-color-text);
}

.sectionHint {
  font-weight: 500;
  color: var(--fs-color-text-muted);
}

.legalEntitiesBlock {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--fs-color-border);
  border-radius: rem(12);
}

.legalEntitiesSearch {
  flex-shrink: 0;
  padding: var(--fs-space-1);
  border-bottom: 1px solid var(--fs-color-border);
}

.legalEntitiesList {
  display: flex;
  flex-direction: column;
  gap: rem(8);
  max-height: rem(64);
  overflow-y: auto;
  padding: var(--fs-space-1);
}

.legalEntityOption {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  gap: rem(8);
  min-height: rem(28);
  font-size: rem(13);
  color: var(--fs-color-text);
  cursor: pointer;
}

.legalEntitiesEmpty {
  margin: 0;
  font-size: rem(13);
  color: var(--fs-color-text-muted);
}

.legalEntityLabel {
  line-height: 1.35;
}

.emptyContacts {
  font-size: rem(13);
  color: var(--fs-color-text-muted);
}

.contactCard {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border);
  border-radius: rem(12);
  background-color: rgb(244 245 245 / 0.45);
}

.contactHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
}

.contactTitle {
  font-size: rem(13);
  font-weight: 600;
}

.removeContact {
  padding: 0;
  border: none;
  font: inherit;
  font-size: rem(12);
  color: var(--fs-color-error);
  text-decoration: underline;
  background: transparent;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

@keyframes applicants-field-error-blink {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--fs-color-error);
  }

  50% {
    box-shadow: 0 0 0 2px rgb(180 35 24 / 0.35);
  }
}
</style>
