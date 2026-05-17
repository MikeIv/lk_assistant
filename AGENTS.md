# Agent workflow — LK Arenda Olimp

Дисциплина работы Cursor Agent (GSD + Superpowers) + стек Nuxt из шаблона Grand.

## Правила (`.cursor/rules/`)

| Файл                      | Назначение                          |
| ------------------------- | ----------------------------------- |
| `00-workflow-core`        | Классы S/M/L/XL, фазы, стоп-сигналы |
| `01-discuss-before-code`  | Уточнение до кода                   |
| `02-planning-gsd`         | План, волны, `.planning/`           |
| `03-execution-discipline` | Минимальный diff, порядок работ     |
| `04-verify-and-done`      | Lint, критерии «готово»             |
| `05-context-hygiene`      | Узкий контекст, `state.md`          |
| `90-project-context`      | Контекст этого репозитория          |
| `nuxt-template`           | Nuxt 4, SCSS, API, линты            |

## Планирование (`.planning/`)

1. Прочитать `PROJECT.md` в новой сессии
2. Для задачи M+: скопировать `brief-template.md` → `brief.md`, заполнить
3. Для L+: добавить `plan.md`, после волн обновлять `state.md` (из `state-template.md`)

Рабочие `brief.md`, `plan.md`, `state.md` не коммитятся (см. `.gitignore`).

## Пример запроса в чат

```text
Класс M. Задача: доработать страницу applications — фильтр по статусу.
Done when: фильтр в UI, запрос через useApi, lint зелёный.
```

## Проверка перед коммитом

`pnpm lint:all` — см. также раздел в `nuxt-template.mdc` и README.
