ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bilingual_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS secondary_language TEXT DEFAULT NULL
    CHECK (secondary_language IN ('pt'));
