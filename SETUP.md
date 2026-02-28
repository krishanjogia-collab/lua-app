# Lua — Setup Guide

## 1. Install Dependencies
```bash
cd lua
npm install
```

## 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=      # From Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY= # From Supabase Dashboard → Project Settings → API
SUPABASE_SERVICE_ROLE_KEY=     # From Supabase Dashboard → Project Settings → API (secret)
GEMINI_API_KEY=                # From Google AI Studio → aistudio.google.com
NEXT_PUBLIC_APP_URL=           # http://localhost:3000 (dev) or your Vercel URL (prod)
```

## 3. Supabase Setup
1. Create a new project at supabase.com
2. Go to **SQL Editor** → paste and run `supabase/migrations/001_initial.sql`
3. Go to **Storage** → create bucket named `assets`, set to **Public**
4. Go to **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 4. Set Admin User
After signing up with your email, run in Supabase SQL Editor:
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE email = 'your@email.com';
```

## 5. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`

## 6. Deploy to Vercel
```bash
npx vercel
```
Add your environment variables in Vercel Dashboard → Project → Settings → Environment Variables.
Then update Supabase Auth → Redirect URLs to include your Vercel domain.

---

## Workflow

### For Admins (Creator Studio):
1. Sign in → navigate to `/studio`
2. Enter a **theme** (e.g. "Galactic Gardens"), select **month**, choose **philosophy**
3. Click **Generate Monthly Curriculum** — Gemini generates all 6 macros for every school day
4. In **Draft Review**, expand each day, edit English/Portuguese text, or use Auto-translate
5. Click **Publish to Subscribers** — curriculum becomes visible to subscribers

### For Subscribers:
1. Sign in → see the **Rolling Calendar** for their subscribed month
2. Click any date → view **Daily Flow Feed** (6 macro activity cards)
3. Toggle **EN/PT** in the navbar to switch all content to Portuguese
4. Visit **Resources** → download theme printables, signage, and guides
5. Use **Parent Bridge** card → copy snippet to share with families

---

## Database Schema

| Table             | Key Fields                                                    |
|-------------------|---------------------------------------------------------------|
| `profiles`        | id, email, active_subscription_month, language_preference, is_admin |
| `curriculum_plans`| id, month_year, theme_name, daily_data (JSONB), is_published  |
| `assets`          | id, plan_id, file_url, asset_type, title                      |

### Subscription Access (RLS)
Subscribers can only read `curriculum_plans` where:
- `is_published = TRUE`
- `month_year = profiles.active_subscription_month`

### Granting a Subscription
```sql
UPDATE public.profiles
SET active_subscription_month = '2024-03'
WHERE email = 'subscriber@school.edu';
```
