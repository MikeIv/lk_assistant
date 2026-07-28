# Документация ЛК брокера

Описание модулей проекта, их взаимодействие и контракты с API.
Читается и разработчиком, и менеджером: в начале доменных документов — **статус для продукта**, ниже — модель, файлы, API, потоки.

## С чего начать

| Задача                           | Документ                             |
| -------------------------------- | ------------------------------------ |
| Обзор слоёв и HTTP               | [architecture.md](./architecture.md) |
| Маршруты и быстрый старт         | [README](../README.md)               |
| Авторизация                      | [auth.md](./auth.md)                 |
| Справочники                      | [directories/](./directories/)       |
| Брокер (календарь, задачи, дела) | [broker.md](./broker.md)             |
| UI Kit                           | [ui-kit.md](./ui-kit.md)             |
| Тесты                            | [testing.md](./testing.md)           |

## Карта документов

| Документ                             | Содержание                                                       | Статус                                                                       |
| ------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [architecture.md](./architecture.md) | Слои SPA, HTTP, mock-режим, навигация, роли                      | готово                                                                       |
| [auth.md](./auth.md)                 | JWT-сессия, refresh cookie, middleware, 401                      | готово                                                                       |
| [testing.md](./testing.md)           | Vitest-проекты, покрытие, как писать тесты                       | готово                                                                       |
| [directories/](./directories/)       | CRUD справочников: обзор + по файлу на каждый (6 живых + 2 stub) | готово                                                                       |
| [broker.md](./broker.md)             | Календарь, задачи, текущие дела                                  | готово                                                                       |
| [ui-kit.md](./ui-kit.md)             | `Ui*`, токены, иконки                                            | готово                                                                       |
| [\_template.md](./_template.md)      | Шаблон документа раздела                                         | шаблон                                                                       |
| reports.md                           | Отчёты (код без страниц)                                         | отложено — нужна продуктовая развилка (оставить / вырезать / вернуть в меню) |

## Внешние ссылки

- [Swagger UI](https://olimpapi.portalrent.ru/docs/broker#/) · [OpenAPI JSON](https://olimpapi.portalrent.ru/docs/broker.json)
- Deploy: `develop` → [lk-assistant-main](https://lk-assistant-main.portalrent.ru), `main` → [brokerolimp](https://brokerolimp.portalrent.ru)
- UI Kit Figma (цвета): [Op9IbTgc66eLejvhLqlZAF](https://www.figma.com/design/Op9IbTgc66eLejvhLqlZAF/?node-id=413-1457)
