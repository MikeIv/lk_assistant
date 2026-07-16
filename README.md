# LK Assistant Olimp — личный кабинет брокера

Фронтенд **ЛК брокера** СК «Олимпийский»: SPA на **Nuxt 4** (Vue 3, TypeScript, Nitro). Режим **`ssr: false`**, UI Kit «Олимпийский», боковая навигация по разделам, интеграция с бэкендом через **`useApi`** / **`useApiFetch`** / **`serverApi`**.

- **Пакет:** `LK_arenda_Olimp`
- **GitLab:** [olimpprojects/lk-assistant](https://gitlab.com/olimpprojects/lk-assistant)
- **Менеджер пакетов:** **pnpm** (версия зафиксирована в `packageManager`)

## Разделы ЛК

| Маршрут                                         | Раздел                            | Статус                                       |
| ----------------------------------------------- | --------------------------------- | -------------------------------------------- |
| `/`                                             | Главная                           | каркас страницы                              |
| `/broker/calendar`                              | Брокер → Календарь                | UI + локальные mock-события (FullCalendar)   |
| `/broker/tasks`                                 | Брокер → Мои задачи               | UI + локальные mock-задачи                   |
| `/broker/current`                               | Брокер → Текущие дела             | таблица и карточка дела, API + mock fallback |
| `/tenants/registry`                             | Арендаторы → Реестр               | заглушка («раздел в разработке»)             |
| `/tenants/requests`                             | Арендаторы → Запросы              | заглушка                                     |
| `/directories/premises`                         | Справочники → Помещения           | CRUD, API + mock fallback                    |
| `/directories/room-types`                       | Справочники → Типы помещений      | CRUD, API + mock fallback                    |
| `/directories/categories`                       | Справочники → Категория           | CRUD, API + mock fallback                    |
| `/directories/legal-entities`                   | Справочники → Юр. лица            | CRUD, API + mock fallback                    |
| `/directories/applicants`                       | Справочники → Претенденты         | CRUD, API + mock fallback                    |
| `/directories/negotiation-statuses`             | Справочники → Статусы переговоров | CRUD, API + mock fallback                    |
| `/directories/brands`, `/directories/contracts` | Бренды, Договоры                  | заглушки (скрыты из подменю)                 |

**Auth и роли** — JWT-сессия; UI-роль из access JWT: [`useCabinetRole`](app/composables/useCabinetRole.ts) (`admin` / `user`).

**Отчёты арендатора** — composables и компоненты в `app/composables/reports/`, `app/components/reports/`; отдельные страницы пока не подключены.

## Требования

- Node.js **22+** (в CI — `node:22-alpine`; pnpm 11.x требует Node ≥ 22.13)
- [pnpm](https://pnpm.io/) 11.x (Corepack + поле `packageManager` в `package.json`)

## Быстрый старт

```bash
pnpm install
cp .env.example .env   # NUXT_PUBLIC_API_BASE, при необходимости NUXT_PUBLIC_CONTRACT_ID
pnpm dev               # http://localhost:3000
```

После `pnpm install` автоматически выполняются `nuxt prepare` и подключение Husky (если есть `.git`).

Пустой `NUXT_PUBLIC_API_BASE` — **mock-режим** (локальные данные без запросов к бэкенду).

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
| `pnpm typecheck`     | проверка типов (`nuxi typecheck`)                           |
| `pnpm verify`        | `lint:all` + `typecheck`                                    |

Перед коммитом: **`pnpm lint:all`** (или **`pnpm verify`** при правках типов / API).

Сообщения коммитов — **строго на английском**, формат [Conventional Commits](https://www.conventionalcommits.org/): `feat: add tenant case filters`, `fix: directory table pagination`.

## Деплой (GitLab CI)

Конфигурация: [`.gitlab-ci.yml`](.gitlab-ci.yml). Runner: build (`docker`) → deploy (`shell`, `grand232`).

| Ветка     | Окружение  | URL                                                                                |
| --------- | ---------- | ---------------------------------------------------------------------------------- |
| `develop` | develop    | [https://lk-assistant-main.portalrent.ru](https://lk-assistant-main.portalrent.ru) |
| `main`    | production | [https://brokerolimp.portalrent.ru](https://brokerolimp.portalrent.ru)             |

На сервере: `/var/www/lk-assistant/{develop|main}` → `~/devdeployer/deploy.sh start`.

## Качество кода и pre-commit

- **ESLint**: `@nuxt/eslint`, [`eslint.config.mjs`](eslint.config.mjs)
- **Prettier**: [`prettier.config.mjs`](prettier.config.mjs); `*.vue` не форматируются Prettier (см. [`.prettierignore`](.prettierignore))
- **Stylelint**: [`stylelint.config.mjs`](stylelint.config.mjs)
- **Husky** + **lint-staged**: [`.husky/pre-commit`](.husky/pre-commit), [`scripts/pre-commit.mjs`](scripts/pre-commit.mjs)

Коммит без хуков: `git commit --no-verify` (осознанно).

## Структура проекта

```
app/
  pages/                  # index, broker/*, tenants/*, directories/*
  components/
    cabinet/              # shell ЛК (sidebar, header, drawer)
    broker/               # календарь, задачи, текущие дела
    direct/               # справочники (premises, categories, …)
    reports/              # таблица отчётов (без страниц)
    ui/                   # UiButton, UiPromoBanner, …
  composables/            # useApi, useCabinetNav, useTenantCases, …
  assets/styles/          # SCSS-токены UI Kit
server/                   # Nitro: api/, utils/serverApi
shared/constants, shared/types, shared/utils
```

Соглашения по стеку и workflow — `.cursor/rules/`, `AGENTS.md`.

## HTTP API

Бэкенд: [Swagger UI](https://olimpapi.portalrent.ru/docs/broker#/) · [OpenAPI JSON](https://olimpapi.portalrent.ru/docs/broker.json)

- База: **`runtimeConfig.public.apiBase`** ← **`NUXT_PUBLIC_API_BASE`** ([`.env.example`](.env.example)), дефолт `https://olimpapi.portalrent.ru/api`
- Пути: **`API_PATHS`** в [`shared/constants/api.ts`](shared/constants/api.ts)
- Клиент: **`useApi()`**, **`useApiFetch()`** — [`app/composables/useApi.ts`](app/composables/useApi.ts)
- Конфиг: **`useApiConfig()`** — mock-режим, docs URL
- Auth token: **`useAuthToken()`** — access JWT до полноценного login-flow
- Сервер: **`serverApi(event?)`** — [`server/utils/serverApi.ts`](server/utils/serverApi.ts)
- **`NUXT_PUBLIC_CONTRACT_ID`** — временный заголовок отчётов до auth

## Документация

- [Nuxt 4](https://nuxt.com/docs/4.x/getting-started/introduction)
- [Деплой Nuxt](https://nuxt.com/docs/getting-started/deployment)
