# LK Arenda Olimp — PROJECT

Постоянный контекст для Cursor Agent.

## Назначение

Фронтенд **личного кабинета аренды** ТРЦ «Олимпийский» (Grand): SPA на Nuxt 4, UI Kit «Олимпийский», интеграция с бэкендом через `useApi` / `serverApi`.

## Разделы ЛК

| Маршрут         | Раздел           | Статус                                |
| --------------- | ---------------- | ------------------------------------- |
| `/`             | Новости          | мок                                   |
| `/reports`      | Мои отчёты       | API + mock без `NUXT_PUBLIC_API_BASE` |
| `/applications` | Мои заявки       | заглушка                              |
| `/passes`       | Мои пропуска     | мок                                   |
| `/premises`     | Моё помещение    | заглушка                              |
| `/data`         | Мои данные       | мок / формы                           |
| `/users`        | Мои пользователи | заглушка (только **admin**)           |

Роли: `admin` / `user` — `useCabinetRole` (заглушка, далее auth/API).

## Стек

| Слой     | Технология                                    |
| -------- | --------------------------------------------- |
| Frontend | Nuxt 4.4, Vue 3, TypeScript, SCSS, `@nuxt/ui` |
| Рендер   | `ssr: false` (SPA, Nitro static)              |
| Таблицы  | `@tanstack/vue-table`                         |
| HTTP     | `useApi`, `useApiFetch`, `serverApi`          |
| Lint     | ESLint, Prettier, Stylelint, Husky            |
| PM       | pnpm 11.x                                     |

## Remote

https://gitlab.com/olimpprojects/lk-assistant.git

## Структура проекта

| Путь                             | Назначение                                      |
| -------------------------------- | ----------------------------------------------- |
| `app/`                           | `srcDir` — pages, components, composables, SCSS |
| `app/components/cabinet/`        | Shell ЛК (sidebar, layout)                      |
| `app/components/ui/`             | UI Kit (`UiButton`, `UiSelect`, …)              |
| `app/composables/reports/`       | Логика раздела «Отчёты»                         |
| `server/utils/`                  | `serverApi` (прокси к внешнему API при нужде)   |
| `shared/types/`, `shared/utils/` | Контракты и нормализация API                    |
| `shared/constants/`              | Моки и константы                                |
| `types/`                         | Augmentation Nuxt (`nuxt-public.d.ts`)          |
| `public/`                        | Статика                                         |
| `scripts/`                       | pre-commit                                      |

`server/api/*` пока нет — запросы идут на внешний API (`NUXT_PUBLIC_API_BASE`).

## Env

| Переменная                | Назначение                          |
| ------------------------- | ----------------------------------- |
| `NUXT_PUBLIC_API_BASE`    | База HTTP API; пусто → mock-режим   |
| `NUXT_PUBLIC_CONTRACT_ID` | Заголовок `Contract-id` для отчётов |

См. `.env.example`. Не коммитить `.env`.

## Деплой

GitLab CI (`.gitlab-ci.yml`): `pnpm build` → deploy на `olimp.portalrent.ru`, production — ветка `main`.

## Команды

```bash
pnpm install
pnpm dev
pnpm lint:all
pnpm typecheck
pnpm verify    # lint:all + typecheck
pnpm build
```

## Ограничения для агента

- Минимальный diff, без лишнего рефакторинга
- Не включать SSR без запроса
- Auth/роли — только по согласованию
- Не коммитить без явной просьбы пользователя

## Cursor rules

- В репозитории: `.cursor/rules/`, `.cursor/commands/`, `.cursor/mcp.json`, `AGENTS.md`
- Контекст: `.cursor/rules/90-project-context.mdc`
- Синхронизация workflow: `d:\_WEB\_Work\_Cursor-rules-template\`
