<script setup lang="ts">
/**
 * Карточка новости UI Kit «Олимпийский» (Figma ShopCard / Card event, photo=true, node 709:1476).
 * Адаптация для ЛК: без кнопок «На карте» и избранного; теги — категория и дата.
 */
const props = withDefaults(
  defineProps<{
    title: string
    excerpt: string
    imageSrc: string
    imageAlt: string
    tags?: string[]
    to?: string
  }>(),
  {
    tags: () => [],
    to: '',
  },
)
</script>

<template>
  <component
    :is="props.to !== '' ? 'NuxtLink' : 'article'"
    :class="$style.root"
    v-bind="props.to !== '' ? { to: props.to } : {}"
  >
    <div :class="$style.media">
      <img :class="$style.image" :src="props.imageSrc" :alt="props.imageAlt" loading="lazy" />
      <div :class="$style.mediaOverlay" aria-hidden="true" />
      <ul v-if="props.tags.length > 0" :class="$style.tags">
        <li v-for="tag in props.tags" :key="tag" :class="$style.tag">
          {{ tag }}
        </li>
      </ul>
    </div>

    <div :class="$style.body">
      <h3 :class="$style.title">{{ props.title }}</h3>
      <p :class="$style.excerpt">{{ props.excerpt }}</p>
    </div>
  </component>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/mixins' as mq;
@use '~/assets/styles/tools/typography' as typo;

.root {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: rem(328);
  overflow: hidden;
  border: 1px solid var(--fs-figma-achromatic-light-gray);
  border-radius: rem(16);
  background: var(--fs-figma-achromatic-white);
  color: var(--fs-figma-achromatic-black);
  text-decoration: none;

  @include mq.from-tablet {
    min-height: rem(420);
    border-radius: rem(25);
  }

  @include mq.from-desktop {
    min-height: rem(496);
  }
}

.media {
  position: relative;
  flex: 1 1 auto;
  min-height: rem(165);
  overflow: hidden;

  @include mq.from-tablet {
    min-height: rem(259);
  }

  @include mq.from-desktop {
    min-height: rem(358);
    border-radius: rem(25) rem(25) 0 0;
  }
}

.image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mediaOverlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgb(0 0 0 / 0) 8%,
    rgb(0 0 0 / 0.11) 24%,
    rgb(0 0 0 / 0.51) 45%,
    rgb(0 0 0 / 0.75) 69%
  );
}

.tags {
  position: absolute;
  bottom: rem(16);
  left: rem(12);
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  margin: 0;
  padding: 0;
  list-style: none;

  @include mq.from-tablet {
    left: rem(16);
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: rem(25);
  padding: 0 rem(12) rem(2);
  border-radius: rem(189);
  background: var(--fs-figma-opacity-white-50);
  backdrop-filter: blur(rem(20));
  color: var(--fs-figma-achromatic-black);
  white-space: nowrap;

  @include typo.fs-text-tag;
  font-weight: 500;
}

.body {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: var(--fs-space-1);
  box-sizing: border-box;
  width: 100%;
  padding: var(--fs-space-3) var(--fs-space-2);

  @include mq.from-tablet {
    gap: var(--fs-space-2);
    padding: var(--fs-space-3);
  }

  @include mq.from-desktop {
    gap: var(--fs-space-2);
    min-height: rem(138);
    padding: rem(24) rem(24) rem(32);
    border-radius: 0 0 rem(25) rem(25);
  }
}

.title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;

  @include typo.fs-text-h4;
}

.excerpt {
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;

  @include typo.fs-text-body;

  @include mq.from-desktop {
    font-size: rem(14);
    letter-spacing: rem(-0.14);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tag {
    backdrop-filter: none;
  }
}
</style>
