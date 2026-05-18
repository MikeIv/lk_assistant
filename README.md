# Nuxt 4 — стартовый шаблон

Универсальный каркас на **Nuxt 4.4.x** (Vue 3, TypeScript, Nitro): `srcDir: app/`, ESLint + Prettier + Stylelint, Husky, глобальные SCSS-токены, **HTTP API** (`useApi` / `useApiFetch` / `serverApi`). Пакетный менеджер — **pnpm** (см. `packageManager` в `package.json`).

В репозитории `Grand` этот же каркас используется для **FoodSity**; при копировании в новый проект достаточно переименовать пакет и брендинг (см. ниже).

## Новый проект на базе шаблона

1. Скопируйте каталог или сделайте fork, затем **`git remote`** на свой origin.
2. В **`package.json`**: поле **`name`** (и при желании `description` / приватность).
3. **`README.md`**: заголовок и описание под ваш продукт.
4. **`app/pages/index.vue`**: заголовок и текст приветствия.
5. **`cp .env.example .env`**: задайте **`NUXT_PUBLIC_API_BASE`**, если фронт ходит на отдельный API (иначе оставьте пустым — относительные пути к текущему origin).
6. **`pnpm install`** → **`pnpm run build`** и **`pnpm run lint:all`** — убедитесь, что всё зелёное.

## Требования

- Node.js LTS (рекомендуется актуальная LTS)
- [pnpm](https://pnpm.io/) 11.x (в репозитории зафиксирована версия через поле `packageManager` и Corepack)

## Установка

```bash
pnpm install
```

После установки автоматически выполняются:

- `postinstall` → `nuxt prepare` (генерация `.nuxt`, в т.ч. база для ESLint)
- `prepare` → `husky` (подключение Git-хуков, если в каталоге уже есть `.git`)

### Новый `git init` в этом проекте

Если репозиторий Git создан **после** первого `pnpm install`, Husky мог не привязаться (сообщение `.git can't be found`). Тогда один раз выполните:

```bash
pnpm exec husky
```

Проверка: `git config --get core.hooksPath` должно выводить `.husky/_`.

### Сборки, заблокированные pnpm

При предупреждении про игнорируемые postinstall-скрипты зависимостей:

```bash
pnpm approve-builds --all
```

В `package.json` уже указан `pnpm.onlyBuiltDependencies` для `unrs-resolver` (см. блок `pnpm`).

## Скрипты

| Команда              | Назначение                                                               |
| -------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`           | dev-сервер (по умолчанию [http://localhost:3000](http://localhost:3000)) |
| `pnpm build`         | production-сборка                                                        |
| `pnpm preview`       | локальный просмотр собранного приложения                                 |
| `pnpm generate`      | статическая генерация (при необходимости)                                |
| `pnpm lint`          | ESLint по проекту                                                        |
| `pnpm lint:fix`      | ESLint с автоисправлением                                                |
| `pnpm format`        | Prettier — запись                                                        |
| `pnpm format:check`  | Prettier — проверка без записи                                           |
| `pnpm stylelint`     | Stylelint для `*.vue` и `*.css`                                          |
| `pnpm stylelint:fix` | Stylelint с автоисправлением                                             |
| `pnpm lint:all`      | последовательно ESLint + Prettier (check) + Stylelint                    |

## Качество кода и pre-commit

- **ESLint**: `@nuxt/eslint`, конфиг [`eslint.config.mjs`](eslint.config.mjs).
- **Prettier**: [`prettier.config.mjs`](prettier.config.mjs); файлы `*.vue` в Prettier **не** форматируются (см. [`.prettierignore`](.prettierignore)).
- **Stylelint**: минимальная конфигурация для стилей в SFC — [`stylelint.config.mjs`](stylelint.config.mjs).
- **Husky**: хук [`.husky/pre-commit`](.husky/pre-commit) вызывает [`scripts/pre-commit.mjs`](scripts/pre-commit.mjs) — баннер с именем из `package.json`, lint-staged с флагом `--concurrent false`.
- **lint-staged**: [`lint-staged.config.mjs`](lint-staged.config.mjs). Если в коммите только файлы вне типов для линта, проверки **пропускаются** с пояснением.

Коммит без хуков: `git commit --no-verify` (использовать осознанно).

## Структура проекта (кратко)

Исходники приложения — в **`app/`** ([`nuxt.config.ts`](nuxt.config.ts), `srcDir`): страницы, компоненты, layouts, composables, плагины, middleware, утилиты, ассеты.

Общий код клиента и Nitro — в **`shared/types`** и **`shared/utils`**.

Сервер Nitro — в **`server/`** (`api/`, `routes/`, `middleware/`, `plugins/`, `utils/`).

## HTTP API (каркас)

- База запросов: **`runtimeConfig.public.apiBase`** ← **`NUXT_PUBLIC_API_BASE`** ([`.env.example`](.env.example)).
- Клиент: **`useApi()`** (`$fetch` с `baseURL`) и **`useApiFetch()`** (полный URL = `apiBase` + путь, без `baseURL` в опциях `useFetch`) — [`app/composables/useApi.ts`](app/composables/useApi.ts).
- Сервер: **`serverApi(event?)`** — [`server/utils/serverApi.ts`](server/utils/serverApi.ts); URL — [`shared/utils/normalizeApiBaseUrl.ts`](shared/utils/normalizeApiBaseUrl.ts) (`normalizeApiBaseUrl`, `joinApiUrl`).
- Типизация `public.apiBase` — [`types/nuxt-public.d.ts`](types/nuxt-public.d.ts). Приватные ключи `runtimeConfig` добавляйте в `nuxt.config` и отдельное расширение `RuntimeConfig` в `types/`.

Правила Cursor (только локально, в Git не коммитятся): `.cursor/rules/`, `AGENTS.md`. Планирование в репозитории — [`.planning/PROJECT.md`](.planning/PROJECT.md).

## Документация

- Документация продукта — в **`docs/`** (по мере появления).
- [Nuxt 4](https://nuxt.com/docs/4.x/getting-started/introduction)
- [Деплой](https://nuxt.com/docs/getting-started/deployment)
