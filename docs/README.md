# Документация ЛК брокера

Описание модулей проекта, их взаимодействие и контракты с API.

## С чего начать

| Задача                   | Документ                             |
| ------------------------ | ------------------------------------ |
| Обзор слоёв и HTTP       | [architecture.md](./architecture.md) |
| Маршруты и быстрый старт | [README](../README.md)               |
| Авторизация              | [auth.md](./auth.md)                 |
| Тесты                    | [testing.md](./testing.md)           |

## Карта документов

| Документ                             | Содержание                                  | Статус      |
| ------------------------------------ | ------------------------------------------- | ----------- |
| [architecture.md](./architecture.md) | Слои SPA, HTTP, mock-режим, навигация, роли | готово      |
| [auth.md](./auth.md)                 | JWT-сессия, refresh cookie, middleware, 401 | готово      |
| [testing.md](./testing.md)           | Vitest-проекты, покрытие, как писать тесты  | готово      |
| [\_template.md](./_template.md)      | Шаблон документа раздела                    | шаблон      |
| directories.md                       | CRUD справочников (6 сущностей)             | планируется |
| broker.md                            | Календарь, задачи, текущие дела             | планируется |
| ui-kit.md                            | `Ui*`, токены, иконки                       | планируется |
| reports.md                           | Отчёты (код без страниц)                    | планируется |

## Внешние ссылки

- [Swagger UI](https://olimpapi.portalrent.ru/docs/broker#/) · [OpenAPI JSON](https://olimpapi.portalrent.ru/docs/broker.json)
- Deploy: `develop` → [lk-assistant-main](https://lk-assistant-main.portalrent.ru), `main` → [brokerolimp](https://brokerolimp.portalrent.ru)
