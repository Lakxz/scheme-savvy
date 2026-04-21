
-- Create enum for scheme level
DO $$ BEGIN
  CREATE TYPE public.scheme_level AS ENUM ('central', 'state');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add scheme_level column to schemes table
ALTER TABLE public.schemes
  ADD COLUMN IF NOT EXISTS scheme_level public.scheme_level NOT NULL DEFAULT 'central';

CREATE INDEX IF NOT EXISTS idx_schemes_scheme_level ON public.schemes(scheme_level);
