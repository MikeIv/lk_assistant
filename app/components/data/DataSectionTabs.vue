<script setup lang="ts">
import { TENANT_DATA_TABS } from '#shared/constants/tenantDataOptions'
import type { TenantDataTabKey } from '#shared/types/tenantData'

const props = defineProps<{
  modelValue: TenantDataTabKey
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TenantDataTabKey]
}>()

function selectTab(key: TenantDataTabKey) {
  emit('update:modelValue', key)
}
</script>

<template>
  <div :class="$style.root" role="tablist" aria-label="Разделы моих данных">
    <button
      v-for="tab in TENANT_DATA_TABS"
      :key="tab.key"
      type="button"
      role="tab"
      :class="[$style.tab, props.modelValue === tab.key && $style.active]"
      :aria-selected="props.modelValue === tab.key"
      @click="selectTab(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: inline-flex;
  flex-wrap: wrap;
  gap: rem(4);
  padding: rem(4);
  border-radius: rem(25);
  background-color: var(--fs-figma-achromatic-light-gray);
}

.tab {
  margin: 0;
  padding: rem(8) var(--fs-space-3);
  border: 0;
  border-radius: rem(25);
  background: transparent;
  cursor: pointer;

  @include typo.fs-text-tag;
  color: var(--fs-figma-achromatic-black);
  transition:
    background-color 0.16s ease,
    color 0.16s ease;

  &:hover:not(.active) {
    color: var(--fs-figma-achromatic-dark-gray);
  }

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

.active {
  background-color: var(--fs-figma-achromatic-white);
}
</style>
