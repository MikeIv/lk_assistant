<script setup lang="ts">
/**
 * Карточка пропуска сотрудника UI Kit «Олимпийский».
 * Figma: vip box (5910:3379, Variant3) — каркас; Icon/Tag 5911:3669; Number Block 5911:3673; Button/Primary 5911:3679.
 */
const props = defineProps<{
  photoSrc: string
  photoAlt: string
  firstName: string
  patronymic: string
  lastName: string
  validUntil: string
  passNumber: string
}>()

const nameRows = computed(() => [props.lastName, props.firstName, props.patronymic])
</script>

<template>
  <article :class="$style.root">
    <div :class="$style.badge">
      <div :class="$style.notch" aria-hidden="true">
        <UIcon name="i-local-pass-card-notch" :class="$style.notchIcon" />
      </div>

      <div :class="$style.photoFrame">
        <img :class="$style.photo" :src="props.photoSrc" :alt="props.photoAlt" loading="lazy" />
      </div>
    </div>

    <div :class="$style.content">
      <div :class="$style.nameBlock">
        <UIcon name="i-local-pass-name-tag" :class="$style.nameBlockIcon" aria-hidden="true" />
        <ul :class="$style.nameList">
          <li v-for="(part, index) in nameRows" :key="`${part}-${index}`" :class="$style.nameRow">
            <span :class="$style.namePart">{{ part }}</span>
          </li>
        </ul>
        <UIcon name="i-local-pass-name-tag" :class="$style.nameBlockIcon" aria-hidden="true" />
      </div>

      <div :class="$style.meta">
        <p :class="$style.numberValue">{{ props.passNumber }}</p>

        <p :class="$style.validity">годен до {{ props.validUntil }}</p>
      </div>
    </div>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;
@use '~/assets/styles/tools/typography' as typo;

.root {
  --pass-card-bg: var(--fs-figma-achromatic-light-gray);

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: rem(330);
  min-height: rem(592);
  overflow: hidden;
  border-radius: rem(25);
  background-color: var(--pass-card-bg);
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    --pass-card-bg: var(--fs-figma-system-gray);
  }

  @include mq.from-desktop {
    max-width: rem(440);
    min-height: rem(570);
  }
}

.badge {
  position: relative;
  flex: 0 0 43.68%;
  width: 100%;
  min-height: rem(254);
  max-height: rem(314);
  background-color: var(--fs-figma-achromatic-white);
}

.notch {
  position: absolute;
  top: rem(6);
  left: 50%;
  z-index: 2;
  display: flex;
  width: rem(20);
  height: rem(10);
  transform: translateX(-50%) rotate(90deg) scaleY(-1);
  pointer-events: none;
}

.notchIcon {
  width: 100%;
  height: 100%;
}

.photoFrame {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  overflow: hidden;
  border: rem(12) solid var(--pass-card-bg);
  border-radius: rem(25) rem(25) 0 0;
  background-color: var(--fs-figma-achromatic-white);
  transition: border-color 0.2s ease;
}

.photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center center;
}

.content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  gap: rem(24);
  box-sizing: border-box;
  width: 100%;
  padding: rem(12) var(--fs-space-3) var(--fs-space-3);
  background-color: var(--pass-card-bg);
  transition: background-color 0.2s ease;
}

.nameBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: rem(12);
  width: 100%;
}

.nameBlockIcon {
  flex-shrink: 0;
  width: rem(14);
  height: rem(14);
}

.nameList {
  display: flex;
  flex-direction: column;
  gap: rem(12);
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nameRow {
  display: flex;
  justify-content: center;
  width: 100%;
}

.namePart {
  @include typo.fs-text-h4;

  font-weight: 600;
  text-align: center;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  align-items: center;
  width: 100%;
}

.numberValue {
  margin: 0;
  color: var(--fs-figma-achromatic-black);
  text-align: center;
  white-space: nowrap;

  @include typo.fs-text-h4;

  font-weight: 500;
}

.validity {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: rem(44);
  margin: 0;
  padding: 0 rem(24) rem(1);
  border: rem(2) solid var(--fs-color-ui-button-border);
  border-radius: rem(25);
  background: var(--fs-figma-achromatic-black);
  color: var(--fs-figma-achromatic-white);
  text-align: center;
  white-space: nowrap;
  backdrop-filter: blur(rem(20));

  @include typo.fs-text-button;
}

@media (prefers-reduced-motion: reduce) {
  .root,
  .content,
  .photoFrame {
    transition: none;
  }

  .validity {
    backdrop-filter: none;
  }
}
</style>
