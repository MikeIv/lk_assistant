# Текущие дела

Раздел **переговоров с арендаторами**: список дел и карточка с помещением, претендентами и ответственным брокером.

Маршрут: `/broker/current` · Карточка: `/broker/current/:id` · В меню: да

См. также: [обзор раздела](./README.md), [помещения](../directories/premises.md), [претенденты](../directories/applicants.md), [статусы переговоров](../directories/negotiation-statuses.md).

---

## Общее описание

### Зачем нужен

Рабочее место брокера по аренде: какое помещение обсуждается, кто претендент, какой статус переговоров и кто ответственный. Список общий для ЛК; фильтр по `user_id` на API ограничивает видимость для обычного брокера.

### Что может пользователь

Полный CRUD:

1. **Список** — поиск, сортировка, пагинация; ссылка «открыть» → карточка.
2. **Создать** — модалка (помещение, претендент, переговоры, ответственный).
3. **Карточка** — вкладки Помещение / Претенденты / КП; сохранить, отменить, удалить (с подтверждением).
4. **Уход без сохранения** — подтверждение, если есть несохранённые изменения.

Данные: **API** (если задан `NUXT_PUBLIC_API_BASE`) или **локальный mock**. В режиме API список **пагинируется на сервере**.

### Какие данные хранит

| Поле / блок в интерфейсе                 | Обязательно | Пояснение                                             |
| ---------------------------------------- | ----------- | ----------------------------------------------------- |
| Помещение                                | да          | из [помещений](../directories/premises.md)            |
| Ответственный                            | да          | ID брокера из `GET …/responsibles` (по помещению)     |
| Претендент(ы)                            | да (≥1)     | из [претендентов](../directories/applicants.md)       |
| Статус переговоров                       | да          | из [статусов](../directories/negotiation-statuses.md) |
| Дата первого контакта                    | да          | на претендента                                        |
| Дата следующего контакта                 | нет         |                                                       |
| Переговоры (дата + информация)           | да (≥1)     | несколько записей на претендента                      |
| Текущий арендатор / контакты / категория | —           | display из API / справочников                         |
| КП                                       | —           | вкладка-заглушка                                      |

### Связи с другими разделами

- **Зависит от:** [помещения](../directories/premises.md), [претенденты](../directories/applicants.md), [статусы переговоров](../directories/negotiation-statuses.md).
- **Опции формы:** `useTenantCaseFormOptions` подгружает rooms / applicants / negotiation-statuses; ответственные — отдельно через `useTenantCaseResponsibles`.

---

## Для разработки (кратко)

| Что         | Где                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| Страницы    | `app/pages/broker/current/index.vue`, `[id].vue`                                                             |
| UI списка   | `app/components/broker/current/` — `Sec`, `Table`, `CreateModal`, `FormFields`                               |
| UI карточки | `CaseTabs`, `CaseRoomTab`, `CaseApplicantsTab`, `CaseApplicantBlock`, `CaseKpTab`, `CaseTableRow`            |
| Composable  | `useTenantCases`, `useTenantCaseForm`, `useTenantCaseFormOptions`, `useTenantCaseResponsibles`               |
| Shared      | `tenantCasesNormalize`, `tenantCasesSchema`, `tenantCasesTable`, `tenantCasesValidation`, `tenantCasesQuery` |
| Mock        | `shared/constants/tenantCasesMock.ts`                                                                        |
| API         | `/v1/broker/tenant-cases`, detail `…/{id}`, responsibles `…/responsibles`                                    |
| Пагинация   | server-side: `page`, `per_page`, `sort`, `direction`, `search?`, `user_id`                                   |

### API

| Операция | Метод и путь                               | Тело / query                                                  |
| -------- | ------------------------------------------ | ------------------------------------------------------------- |
| List     | `GET /v1/broker/tenant-cases`              | `page`, `per_page`, `sort`, `direction`, `search?`, `user_id` |
| Show     | `GET /v1/broker/tenant-cases/{id}`         | —                                                             |
| Create   | `POST /v1/broker/tenant-cases`             | `room_id`, `responsible` (ID), претендент, переговоры         |
| Update   | `PUT /v1/broker/tenant-cases/{id}`         | `room_id`, `responsible` (ID), `applicants[]`                 |
| Delete   | `DELETE /v1/broker/tenant-cases/{id}`      | —                                                             |
| Free     | `GET /v1/broker/tenant-cases/responsibles` | `room_id`, опц. `tenant_case_id` (edit)                       |

`user_id` (JWT `sub`): брокер — только дела, где он ответственный; руководитель брокеров — все.

Опции формы (API-режим):

| Справочник          | Метод и путь                                                          |
| ------------------- | --------------------------------------------------------------------- |
| Помещения           | `GET /v1/broker/dict/rooms?available_for_tenant_case=1&per_page=1000` |
| Претенденты         | `GET /v1/broker/tenant-applicants?per_page=1000`                      |
| Статусы переговоров | `GET /v1/broker/dict/negotiation-statuses?per_page=1000`              |
| Ответственные       | `GET /v1/broker/tenant-cases/responsibles`                            |

### Потоки

**Список**

1. `/broker/current` → `BrokerCurrentSec` → `useTenantCases` загружает список.
2. Поиск / сортировка / пагинация; «открыть» → `/broker/current/{id}`.
3. «Создать» → `CreateModal` → POST / mock create.

**Создание**

1. Модалка: поля + **Ответственный** (disabled без помещения; список при открытии селектора).
2. Смена помещения очищает ответственного.

**Карточка**

1. Загрузка дела по id; вкладки: **Помещение**, **Претенденты**, **КП**.
2. Вкладка **Помещение**: параметры помещения + селектор **Ответственный** (lazy `GET …/responsibles?room_id&tenant_case_id`).
3. Сохранение / удаление через composable; POST/PUT передают `responsible` (ID).
4. Вкладка **КП** — UI-заглушка.

### Тесты

| Область                                 | Файлы                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------- |
| Unit (normalize/table/query/validation) | `test/unit/shared/utils/tenantCases.test.ts`                                |
| Schema                                  | `test/unit/shared/utils/directoriesSchema.test.ts` (`tenantCaseFormSchema`) |
| Domain CRUD                             | `test/nuxt/useTenantCases.test.ts`                                          |
| Форма                                   | `test/nuxt/useTenantCaseForm.test.ts`                                       |
| Опции справочников                      | `test/nuxt/useTenantCaseFormOptions.test.ts`                                |
| Ответственные                           | `test/nuxt/useTenantCaseResponsibles.test.ts`                               |
| Table UI                                | `test/nuxt/brokerCurrentTable.contract.test.ts`                             |
