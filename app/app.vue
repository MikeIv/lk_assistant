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
