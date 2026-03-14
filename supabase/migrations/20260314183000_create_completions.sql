-- Migration 5.1: Create completions table for Gamification Framework

CREATE TABLE IF NOT EXISTS public.completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.curriculum_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  domains_completed JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- A user can only have one completion record per day
  UNIQUE(user_id, date)
);

-- RLS Policies
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions" 
  ON public.completions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" 
  ON public.completions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions" 
  ON public.completions 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Optional: Add an index on date for faster lookups when querying streaks
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON public.completions(user_id, date);
