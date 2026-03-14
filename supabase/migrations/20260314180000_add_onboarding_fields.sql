-- Phase 3.7 Onboarding Schema Updates
-- Add planning cadence and age group to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS planning_cadence TEXT DEFAULT 'monthly'
    CHECK (planning_cadence IN ('weekly', 'monthly')),
  ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT '4-5'
    CHECK (age_group IN ('3-4', '4-5', 'mixed'));
