# LK Arenda Olimp — PROJECT

Постоянный контекст для агента и планирования. Обновляйте при смене архитектуры или API.

## Назначение

Личный кабинет аренды на Nuxt 4 (SPA). Разделы: заявки, отчёты, пользователи. Оболочка кабинета: shell-компоненты (структура гибкая — layout, навигация, роли могут меняться).

## Стек

| Слой       | Технология                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | Nuxt 4.4, Vue 3, @nuxt/ui, @nuxt/icon                 |
| Рендер     | CSR only (`ssr: false`)                               |
| Стили      | SCSS, CSS Modules, UI Kit Олимпийский (margin tokens) |
| API client | `useApi`, `useApiFetch` → `NUXT_PUBLIC_API_BASE`      |
| Server     | Nitro `server/`, `serverApi`                          |
| Качество   | ESLint, Prettier, Stylelint, Husky                    |

## Ключевые модули

| Путь                                | Назначение                  |
| ----------------------------------- | --------------------------- |
| `app/pages/applications/`           | Заявки                      |
| `app/pages/reports/`                | Отчёты                      |
| `app/pages/users/`                  | Пользователи                |
| `app/components/cabinet/`           | Shell ЛК (структура гибкая) |
| `app/composables/useCabinetNav.ts`  | Навигация                   |
| `app/composables/useCabinetRole.ts` | Роли                        |
| `app/composables/useApi.ts`         | HTTP к бэкенду              |
| `server/utils/serverApi.ts`         | API с Nitro                 |

## Команды

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint:all
```

## Ограничения для агента

- Не менять `ssr: false` и порядок модулей без согласования
- API только через `useApi` / `useApiFetch` / `serverApi`
- SFC: `script setup` → `template` → `style module lang="scss"`
- Секреты: только `.env.example` в git

## Cursor rules

- Workflow (GSD + Superpowers): `.cursor/rules/00-workflow-core.mdc` … `06-fundamental-principles.mdc`
- Стек Nuxt: `.cursor/rules/nuxt-template.mdc`
- Краткий контекст: `.cursor/rules/90-project-context.mdc`

## Ссылки

- [README.md](../README.md)
- [Nuxt 4 docs](https://nuxt.com/docs/4.x/getting-started/introduction)
