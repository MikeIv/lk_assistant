# Тесты и покрытие

Стратегия: unit на чистой логике (`shared/utils`), nuxt-тесты на composables и middleware, точечные тесты компонентов. E2E пока нет.

---

## Инфраструктура

| Что     | Значение                             |
| ------- | ------------------------------------ |
| Раннер  | Vitest 4                             |
| Конфиг  | `vitest.config.ts` — два projects    |
| DOM     | happy-dom (проект `nuxt`)            |
| Хелперы | `test/helpers/` (JWT, mock auth API) |

### Проекты

| Проект | Include                         | Environment        | Что тестировать                               |
| ------ | ------------------------------- | ------------------ | --------------------------------------------- |
| `unit` | `test/unit/**/*.{test,spec}.ts` | `node`             | `shared/utils/**` — чистые функции            |
| `nuxt` | `test/nuxt/**/*.{test,spec}.ts` | `nuxt` + happy-dom | composables, middleware; точечно — компоненты |

Граница: всё без Nuxt-рантайма → `unit`. Composables с `useState` / автоимпортами / `onMounted` → `nuxt`.

Проект `nuxt` с `fileParallelism: false` — не класть туда тесты чистых утилит.

### Команды

```bash
pnpm test                 # unit + nuxt
pnpm test -- --project unit
pnpm test -- --project nuxt
pnpm test:watch
pnpm test:cov             # + coverage (v8) → coverage/
pnpm verify               # lint:all + typecheck + test
```

CI (`develop` / `main`): `lint:all` + `typecheck` + `test:cov` → затем `build`. Отчёты: JUnit, Cobertura.

---

## Что покрыто сейчас (auth)

| Область                  | Файлы                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Unit utils               | `test/unit/jwtPayload.test.ts`, `cabinetRoleFromJwt`, `loginSchema`, `loginErrors`, `authCrossTab` |
| Composables / middleware | `test/nuxt/useAuth.test.ts`, `useAuthToken`, `useApi`, `useCabinetRole`, `authMiddleware`          |
| Helpers                  | `test/helpers/jwt.ts`, `authApi.ts`, `test/nuxt/resetAuthClientState.ts`                           |

Flows auth: [auth.md](./auth.md).

---

## Целевое покрытие

| Слой                             | Цель              | Примечание                                     |
| -------------------------------- | ----------------- | ---------------------------------------------- |
| `shared/utils/**`                | 85–90%            | validation, normalize, table, schema           |
| `app/composables/**`, middleware | 65–75%            | domain CRUD, tenant cases, nav                 |
| `app/components/**`              | без общего порога | точечно: `UiSelect`, формы ввода, одна таблица |
| e2e                              | нет               | опционально позже (mock-режим + Playwright)    |

`.vue` в общий % порога не включают: UI меняется чаще логики.

### Baseline и пороги CI

Замер (auth-only, 2026-07-28) по `include` в `vitest.config.ts`
(`shared/utils`, `app/composables`, `app/middleware`, `server/utils`):

| Метрика    | Baseline | Порог |
| ---------- | -------- | ----- |
| Lines      | 9.11%    | 8%    |
| Statements | 9.14%    | 8%    |
| Functions  | 7.46%    | 7%    |
| Branches   | 7.89%    | 7%    |

Пороги поднимают после добавления тестов. Auth-файлы уже ~85–100% lines.

---

## Как писать тест

1. Чистая функция (`shared/utils`) → `test/unit/…`, без моков Nuxt.
2. Composable / middleware → `test/nuxt/…` (эталон: `useApi.test.ts` — `mockNuxtImport`, stub `$fetch`, сброс в `beforeEach`).
3. Шесть справочников — общий контракт (`describe.each`), не шесть копий одного spec.
4. Новые файлы зеркалят путь исходника: `test/unit/shared/utils/premisesTable.test.ts`. Auth-тесты не переносить ради структуры.
5. Фикстуры — `test/fixtures/` (по мере появления).

Новая бизнес-логика (API, auth, domain) — unit или smoke. Крупный модуль — тест или явное обоснование пропуска.

---

## Ограничения

- Не гнаться за 100% / порогом по всем `.vue`.
- Полный `pnpm test` не в pre-commit (гейт — `pnpm verify` / CI).
- Рефакторинг шести справочников в дженерики — отдельно от покрытия; сначала контрактные тесты.
- Storybook / e2e — только по отдельному решению.

---

## Связанные документы

- [architecture.md](./architecture.md) — слои и HTTP
- [auth.md](./auth.md) — flows, покрытые тестами
- [\_template.md](./_template.md) — секция «Тесты» в документах разделов
