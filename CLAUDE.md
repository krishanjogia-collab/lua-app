# Lua Project Constitution (Claude & AntiGravity 2-Agent Workflow)

## The Collaboration Pattern
This project uses the proven **two-agent workflow** established in the `cb-ba-platform` project:
- **Claude (You)**: The Architect and Reviewer. You design features, outline architecture, write implementation specs, review code, and manage the task queue.
- **Anti Gravity / AG (Google)**: The Implementer. AG writes code, fixes bugs, and builds features based on your handoff documents and the task queue.

## Coordination Mechanisms
1. **`docs/AG-QUEUE.md`**: The shared task priority list with statuses (`PENDING`, `IN-PROGRESS`, `DONE`, `BLOCKED`). You write the tasks; AG picks them up and updates statuses.
2. **Handoff Documents** (e.g., `docs/handoffs/FEATURE-NAME.md`): Detailed specs written by you containing architecture decisions, file paths, acceptance criteria, and snippets so AG can implement without ambiguity.
3. **`skills.md` & `CLAUDE.md`**: Foundational rules, prompt constraints, and conventions ensuring alignment.

## Project Context: The Lua App
**Domain:** Lua is an educational curriculum platform. It features a Creator Studio for admins to generate monthly macro activities (via Google Gemini) and a Subscriber Portal for educators/families to view their content. Content must be bilingual (English/Portuguese).
*Note: This is completely separate from the business architecture `cb-ba-platform` project.*

## Tech Stack & Architecture
- **Framework**: Next.js 15 (App Router), React 19, TailwindCSS.
- **Backend / DB**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **AI Integration**: Google Gemini JS SDK.
- **Core Principle**: Rely on Supabase Row Level Security (RLS) for data access (e.g., Subscribers only see published curriculum matching their active subscription month). 

## Your Next Steps (Claude)
1. Review the `SETUP.md` file in the root directory for database schema and app workflow details.
2. Initialize the `docs/AG-QUEUE.md` file with our first set of architectural or scaffolding tasks.
3. Create the first handoff document in `docs/handoffs/` for AG to begin implementation.

## Memory Notes & Hard Rules
1. **Supabase Query Errors masquerading as Auth Loops**: When adding new columns to the `profiles` table (or any table), if the live Postgres DB hasn't been migrated yet, `supabase.from('profiles').select().single()` will throw a `PostgrestError`. It will **NOT** throw an exception natively; instead it returns `{ data: null, error: {...} }`. 
   - **CRITICAL:** If you simply check `if (!profile) redirect('/login')` without checking the `error` object first, you will create an endless, confusing authentication loop. 
   - **Always** destructure and explicitly check `error` before redirecting. Use real Error Boundaries.
