-- Mydobby database schema
-- Run this in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  avatar TEXT,
  letter_messenger TEXT NOT NULL DEFAULT 'Owl',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_available TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  mind_dump TEXT NOT NULL DEFAULT '',
  goal TEXT NOT NULL DEFAULT '',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.check_in_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('done', 'partial', 'stuck', 'blocked')),
  action_label TEXT NOT NULL DEFAULT '',
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('monthly', 'milestone')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_ins_profile_id
  ON public.check_ins(profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_check_in_history_check_in_id
  ON public.check_in_history(check_in_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_letters_profile_id
  ON public.letters(profile_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_check_ins_updated_at
BEFORE UPDATE ON public.check_ins
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by anyone"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Profiles can be inserted by anyone"
ON public.profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Profiles can be updated by anyone"
ON public.profiles
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Check-ins are viewable by anyone"
ON public.check_ins
FOR SELECT
USING (true);

CREATE POLICY "Check-ins can be inserted by anyone"
ON public.check_ins
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Check-ins can be updated by anyone"
ON public.check_ins
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Check-in history is viewable by anyone"
ON public.check_in_history
FOR SELECT
USING (true);

CREATE POLICY "Check-in history can be inserted by anyone"
ON public.check_in_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Letters are viewable by anyone"
ON public.letters
FOR SELECT
USING (true);

CREATE POLICY "Letters can be inserted by anyone"
ON public.letters
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Letters can be updated by anyone"
ON public.letters
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Optional helper view for dashboard-like summaries
CREATE OR REPLACE VIEW public.user_reflection_summary AS
SELECT
  p.id AS profile_id,
  p.display_name,
  p.avatar,
  COUNT(DISTINCT ci.id) AS check_in_count,
  COUNT(DISTINCT l.id) AS letter_count,
  MAX(ci.created_at) AS last_check_in_at,
  MAX(l.created_at) AS last_letter_at
FROM public.profiles p
LEFT JOIN public.check_ins ci ON ci.profile_id = p.id
LEFT JOIN public.letters l ON l.profile_id = p.id
GROUP BY p.id, p.display_name, p.avatar;
