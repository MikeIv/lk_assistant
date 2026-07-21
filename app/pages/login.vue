<script setup lang="ts">
import { getLoginErrorMessage } from '#shared/utils/loginErrors'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Вход — Личный кабинет',
})

const { login } = useAuth()
const { handleSubmit, errors, email, emailAttrs, password, passwordAttrs } = useLoginForm()

const generalError = ref<string | null>(null)
const isSubmitting = ref(false)
const passwordVisible = ref(false)

const onSubmit = handleSubmit(async (values) => {
  generalError.value = null
  isSubmitting.value = true

  try {
    await login({
      email: values.email,
      password: values.password,
      remember: true,
    })
    await navigateTo('/', { replace: true })
  } catch (error) {
    generalError.value = getLoginErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <form :class="$style.card" novalidate @submit.prevent="onSubmit">
    <div :class="$style.brand" aria-label="Олимпийский">
      <UIcon name="i-local-logo-tablet" :class="$style.logo" aria-hidden="true" />
    </div>

    <h1 :class="$style.title">Войдите в аккаунт</h1>

    <p v-if="generalError" id="login-general-error" :class="$style.generalError" role="alert">
      {{ generalError }}
    </p>

    <div :class="$style.field">
      <label :class="$style.label" for="login-email">
        Адрес электронной почты
        <span :class="$style.required" aria-hidden="true">*</span>
      </label>
      <UiInput
        id="login-email"
        v-bind="emailAttrs"
        v-model="email"
        type="email"
        autocomplete="username"
        inputmode="email"
        :disabled="isSubmitting"
        :aria-invalid="Boolean(errors.email) || undefined"
        aria-describedby="login-email-error"
      />
      <span
        id="login-email-error"
        :class="$style.fieldError"
        :role="errors.email ? 'alert' : undefined"
      >
        {{ errors.email }}
      </span>
    </div>

    <div :class="$style.field">
      <label :class="$style.label" for="login-password">
        Пароль
        <span :class="$style.required" aria-hidden="true">*</span>
      </label>
      <UiInput
        id="login-password"
        v-bind="passwordAttrs"
        v-model="password"
        :type="passwordVisible ? 'text' : 'password'"
        autocomplete="current-password"
        :disabled="isSubmitting"
        :aria-invalid="Boolean(errors.password) || undefined"
        aria-describedby="login-password-error"
      >
        <template #trailing>
          <button
            type="button"
            :class="$style.eyeBtn"
            :aria-label="passwordVisible ? 'Скрыть пароль' : 'Показать пароль'"
            :disabled="isSubmitting"
            @click.prevent="passwordVisible = !passwordVisible"
          >
            <UIcon
              :name="passwordVisible ? 'i-local-eye-off' : 'i-local-eye'"
              :class="$style.eyeIcon"
              aria-hidden="true"
            />
          </button>
        </template>
      </UiInput>
      <span
        id="login-password-error"
        :class="$style.fieldError"
        :role="errors.password ? 'alert' : undefined"
      >
        {{ errors.password }}
      </span>
    </div>

    <UiButton type="submit" variant="auth" :class="$style.submit" :loading="isSubmitting">
      Войти
    </UiButton>
  </form>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as *;
@use '~/assets/styles/tools/typography' as typo;

.card {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
  box-sizing: border-box;
  width: 100%;
  padding: rem(40) rem(32);
  border: 1px solid var(--fs-figma-stroke-light-gray);
  border-radius: rem(16);
  background: var(--fs-figma-achromatic-white);
}

.brand {
  display: flex;
  justify-content: center;
}

.logo {
  display: block;
  width: rem(222);
  height: rem(22);
  color: var(--fs-figma-achromatic-black);
}

.title {
  // gap + margin → 2× между лого и заголовком
  margin: var(--fs-space-3) 0 0;
  text-align: center;

  @include typo.fs-text-h2;
  color: var(--fs-figma-achromatic-black);
}

.generalError {
  margin: 0;
  padding: rem(10) rem(12);
  border-radius: rem(10);
  background: rgb(238 46 34 / 0.08);
  color: var(--fs-color-error);
  font-size: rem(13);
  line-height: 1.35;
}

.field {
  display: flex;
  flex-direction: column;
  gap: rem(6);
}

.label {
  font-size: rem(13);
  font-weight: 600;
  line-height: 1.3;
  color: var(--fs-color-text);
}

.required {
  color: var(--fs-color-error);
}

.fieldError {
  margin: 0;
  min-height: 1.3em;
  font-size: rem(12);
  line-height: 1.3;
  color: var(--fs-color-error);
}

.eyeBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: rem(36);
  height: rem(36);
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: rem(8);
  background: transparent;
  color: var(--fs-figma-achromatic-dark-gray);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: rem(2) solid var(--fs-color-primary);
    outline-offset: rem(2);
  }
}

.eyeIcon {
  display: block;
  width: rem(22);
  height: rem(22);
}

.submit {
  width: 100%;
  min-height: rem(48);
  margin-top: var(--fs-space-1);
}
</style>
