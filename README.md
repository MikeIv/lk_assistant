# LK Arenda Olimp — личный кабинет аренды

Фронтенд **личного кабинета аренды** (Grand / Олимпийский): SPA на **Nuxt 4.4** (Vue 3, TypeScript, Nitro). Режим **`ssr: false`**, UI Kit «Олимпийский», нижняя навигация по разделам, интеграция с бэкендом через **`useApi`** / **`useApiFetch`** / **`serverApi`**.

Пакет: **`LK_arenda_Olimp`**. Менеджер пакетов — **pnpm** (версия зафиксирована в `packageManager`).

## Разделы ЛК

| Маршрут         | Раздел           | Статус                           |
| --------------- | ---------------- | -------------------------------- |
| `/`             | Новости          | карточки новостей (мок)          |
| `/reports`      | Мои отчёты       | заглушка                         |
| `/applications` | Мои заявки       | заглушка                         |
| `/passes`       | Мои пропуска     | заглушка                         |
| `/data`         | Мои данные       | заглушка                         |
| `/users`        | Мои пользователи | заглушка (только роль **admin**) |

Роли: **`admin`** и **`user`** — [`app/composables/useCabinetRole.ts`](app/composables/useCabinetRole.ts) (пока заглушка, далее — авторизация / API).

## Требования

- Node.js LTS (рекомендуется актуальная LTS)
- [pnpm](https://pnpm.io/) 11.x (Corepack + поле `packageManager` в `package.json`)

## Быстрый старт

```bash
pnpm install
cp .env.example .env   # при необходимости задайте NUXT_PUBLIC_API_BASE
pnpm dev               # http://localhost:3000
```

После `pnpm install` автоматически выполняются `nuxt prepare` и подключение Husky (если есть `.git`).

### Husky после `git init`

Если репозиторий создан **после** первого `pnpm install`, один раз:

```bash
pnpm exec husky
```

Проверка: `git config --get core.hooksPath` → `.husky/_`.

### Заблокированные postinstall-скрипты pnpm

```bash
pnpm approve-builds --all
```

## Скрипты

| Команда              | Назначение                                                  |
| -------------------- | ----------------------------------------------------------- |
| `pnpm dev`           | dev-сервер ([http://localhost:3000](http://localhost:3000)) |
| `pnpm build`         | production-сборка                                           |
| `pnpm preview`       | локальный просмотр собранного приложения                    |
| `pnpm generate`      | статическая генерация (при необходимости)                   |
| `pnpm lint`          | ESLint по проекту                                           |
| `pnpm lint:fix`      | ESLint с автоисправлением                                   |
| `pnpm format`        | Prettier — запись                                           |
| `pnpm format:check`  | Prettier — проверка без записи                              |
| `pnpm stylelint`     | Stylelint для `*.vue` и `*.css`                             |
| `pnpm stylelint:fix` | Stylelint с автоисправлением                                |
| `pnpm lint:all`      | ESLint + Prettier (check) + Stylelint                       |

Перед коммитом: **`pnpm lint:all`**.

## Качество кода и pre-commit

- **ESLint**: `@nuxt/eslint`, [`eslint.config.mjs`](eslint.config.mjs)
- **Prettier**: [`prettier.config.mjs`](prettier.config.mjs); `*.vue` не форматируются Prettier (см. [`.prettierignore`](.prettierignore))
- **Stylelint**: [`stylelint.config.mjs`](stylelint.config.mjs)
- **Husky** + **lint-staged**: [`.husky/pre-commit`](.husky/pre-commit), [`scripts/pre-commit.mjs`](scripts/pre-commit.mjs)

Коммит без хуков: `git commit --no-verify` (осознанно).

## Структура проекта

```
app/                    # srcDir: страницы, компоненты, layouts, composables
  pages/                # index, reports, applications, passes, data, users
  components/cabinet/   # shell ЛК (шапка, навигация, drawer)
  components/ui/        # UiButton, UiPromoBanner, UiNewsCard, …
  composables/          # useApi, useCabinetNav, useCabinetRole, …
  assets/styles/        # SCSS-токены UI Kit, margin, typography
  assets/icons/         # logo, nav-*, arrows/*
server/                 # Nitro: api/, utils/serverApi
shared/types, shared/utils
docs/                   # продуктовая документация (по мере появления)
```

Соглашения по стеку, workflow агента и верстке — в `.cursor/rules/`, `AGENTS.md`, `.planning/PROJECT.md`.

## HTTP API

Бэкенд: [Swagger UI](https://olimpapi.portalrent.ru/docs/api#/) · [OpenAPI JSON](https://olimpapi.portalrent.ru/docs/api.json)

- База: **`runtimeConfig.public.apiBase`** ← **`NUXT_PUBLIC_API_BASE`** ([`.env.example`](.env.example)), дефолт `https://olimpapi.portalrent.ru/api`
- Пути: **`API_PATHS`** в [`shared/constants/api.ts`](shared/constants/api.ts)
- Клиент: **`useApi()`**, **`useApiFetch()`** — [`app/composables/useApi.ts`](app/composables/useApi.ts) (Bearer + cookies)
- Конфиг: **`useApiConfig()`** — mock-режим, docs URL
- Auth token: **`useAuthToken()`** — access JWT до полноценного login-flow
- Сервер: **`serverApi(event?)`** — [`server/utils/serverApi.ts`](server/utils/serverApi.ts)
- Типизация `public.*` — [`types/nuxt-public.d.ts`](types/nuxt-public.d.ts)

Пустой `NUXT_PUBLIC_API_BASE` — mock-режим (локальные данные).

## Документация

- [Nuxt 4](https://nuxt.com/docs/4.x/getting-started/introduction)
- [Деплой Nuxt](https://nuxt.com/docs/getting-started/deployment)
