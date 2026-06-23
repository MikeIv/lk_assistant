---
description: Code review — local diff или GitLab MR
argument-hint: [mr-iid | mr-url | пусто = local]
---

# Code Review

**Input:** $ARGUMENTS · Протокол: `04-verify-and-done.mdc`

| Input      | Режим                                                  |
| ---------- | ------------------------------------------------------ |
| Пусто      | **Local** — `git diff --name-only HEAD`, файлы целиком |
| MR IID/URL | **GitLab** — diff MR (если доступен `glab` / API)      |

Платформа **GitLab**, не GitHub.

1. Файлы целиком
2. CRITICAL → LOW (`04`)
3. lint/typecheck/build из `90-project-context`

Отчёт: **OK** | **FIX REQUIRED** | **BLOCK** + pipeline.
