ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS onboarding_dismissed boolean NOT NULL DEFAULT false;