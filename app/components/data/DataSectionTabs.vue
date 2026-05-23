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

/* Figma Sidebar Segment control (2246:3394) — компактный вариант */
.root {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: rem(2);
  width: fit-content;
  max-width: 100%;
  padding: rem(3);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(99);
  background-color: var(--fs-figma-achromatic-white);
}

.tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: rem(36);
  margin: 0;
  padding: rem(6) rem(14);
  border: 0;
  border-radius: rem(99);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  text-align: left;

  @include typo.fs-text-tag;
  color: var(--fs-figma-achromatic-dark-gray);
  transition:
    background-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }

  &:hover:not(.active) {
    color: var(--fs-figma-achromatic-black);
  }
}

.active {
  color: var(--fs-figma-achromatic-white);
  background-color: var(--fs-figma-achromatic-dark-gray);
  box-shadow: 0 0 rem(5) rgb(0 0 0 / 0.18);
}
</style>
