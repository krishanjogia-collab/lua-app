-- ============================================================
-- Lua Pre-K Curriculum Engine — Initial Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id                        UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                     TEXT        NOT NULL,
  active_subscription_month TEXT        DEFAULT NULL,  -- e.g. "2024-03"
  language_preference       TEXT        NOT NULL DEFAULT 'en' CHECK (language_preference IN ('en', 'pt')),
  is_admin                  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CURRICULUM PLANS
-- ============================================================
CREATE TABLE public.curriculum_plans (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_year   TEXT        NOT NULL,   -- e.g. "2024-03"
  theme_name   TEXT        NOT NULL,
  daily_data   JSONB       NOT NULL DEFAULT '{}',
  is_published BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (month_year)
);

CREATE TRIGGER curriculum_plans_updated_at
  BEFORE UPDATE ON public.curriculum_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for faster JSONB queries
CREATE INDEX idx_curriculum_plans_month_year ON public.curriculum_plans(month_year);
CREATE INDEX idx_curriculum_plans_daily_data ON public.curriculum_plans USING GIN (daily_data);

-- ============================================================
-- ASSETS
-- ============================================================
CREATE TABLE public.assets (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id    UUID        NOT NULL REFERENCES public.curriculum_plans(id) ON DELETE CASCADE,
  file_url   TEXT        NOT NULL,
  asset_type TEXT        NOT NULL CHECK (asset_type IN ('Printable', 'Signage', 'Guide')),
  title      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_plan_id ON public.assets(plan_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- CURRICULUM PLANS
ALTER TABLE public.curriculum_plans ENABLE ROW LEVEL SECURITY;

-- Subscribers: read only published plans matching their active subscription month
CREATE POLICY "Subscribers can read matching published plans"
  ON public.curriculum_plans FOR SELECT
  USING (
    is_published = TRUE
    AND month_year = (
      SELECT active_subscription_month
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Admins: full access
CREATE POLICY "Admins have full access to curriculum plans"
  ON public.curriculum_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ASSETS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Subscribers: read assets for their active subscription plan
CREATE POLICY "Subscribers can read assets for their subscription month"
  ON public.assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.curriculum_plans cp
      JOIN public.profiles pr ON pr.active_subscription_month = cp.month_year
      WHERE cp.id = assets.plan_id
        AND pr.id = auth.uid()
        AND cp.is_published = TRUE
    )
  );

-- Admins: full access to assets
CREATE POLICY "Admins have full access to assets"
  ON public.assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================
-- SUPABASE STORAGE BUCKET
-- ============================================================
-- Run in Supabase Dashboard or add to storage setup:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage policy: allow authenticated users to read files
-- CREATE POLICY "Public read on assets bucket"
--   ON storage.objects FOR SELECT USING (bucket_id = 'assets');
-- CREATE POLICY "Admins upload to assets bucket"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'assets' AND
--     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
--   );
