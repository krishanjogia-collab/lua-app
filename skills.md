---
name: Lua App Development Skills
description: Core conventions, workflows, and prompts for agentic development on the Lua App.
---

# Lua App Agentic Ways of Working

This file contains the foundational rules, context, and conventions for AI agents and developers working on the Lua project. Refer to this document before starting new tasks to ensure alignment.

## 1. Core Architecture & Tech Stack
- **Frontend / Meta-framework:** Next.js (App Router), React, TailwindCSS.
- **Backend / Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **AI Integration:** Google Gemini JS SDK for generating macro curriculum flows.

## 2. Project Conventions
- **Language & i18n:** Content must support both English and Portuguese. Ensure toggles and fallback text are handled gracefully.
- **Database Safety (RLS):** Always rely on Row Level Security (RLS) for data access. For instance, subscribers can only read `curriculum_plans` if `is_published = TRUE` and the month matches their `active_subscription_month`.
- **UI Aesthetics:** The UI should be accessible, friendly, and clean—suitable for educators and families.

## 3. Agent Workflow (The "2-Agent" Pattern)
1. **Shared Kanban (`task.md`):** Check and update `task.md` linearly. Mark as `[/]` when in progress, `[x]` when complete.
2. **Plan Before Coding:** Always update `implementation_plan.md` with architectural intents before writing significant code. Use `notify_user` to request approval.
3. **Task Boundaries:** Ensure high-level tasks are broken down cleanly and context is maintained via the `task_boundary` tool.
4. **Skills Context:** Treat this `skills.md` file as the system-level priority for coding patterns. 

## 4. Useful Commands
- Run Local Server: `npm run dev`
- Vercel Deployment: `npx vercel`
- Supabase DB changes: Use the SQL Editor based on migrations in `supabase/migrations/`
