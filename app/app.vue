<script setup lang="ts">
const APP_TITLE = 'ЛК'
const APP_TITLE_DEFAULT = `${APP_TITLE} | Олимпийский`
const APP_DESCRIPTION = 'Личный кабинет сотрудника ТРЦ «Олимпийский»'

useHead({
  titleTemplate: (title) => (title ? `${title} | ${APP_TITLE}` : APP_TITLE_DEFAULT),
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: APP_DESCRIPTION },
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
    { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64x64.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  ],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
