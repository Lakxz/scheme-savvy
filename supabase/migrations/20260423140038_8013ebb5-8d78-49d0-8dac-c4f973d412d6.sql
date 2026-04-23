-- New enums
DO $$ BEGIN
  CREATE TYPE public.marital_status_type AS ENUM ('single', 'married', 'widowed', 'divorced', 'separated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.farmer_type AS ENUM ('landless', 'marginal', 'small', 'medium', 'large');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.ration_card_type AS ENUM ('none', 'apl', 'bpl', 'aay', 'priority');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Profile additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marital_status public.marital_status_type,
  ADD COLUMN IF NOT EXISTS dependents integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS religion text,
  ADD COLUMN IF NOT EXISTS sub_caste text,
  ADD COLUMN IF NOT EXISTS land_acres numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS farmer_type public.farmer_type,
  ADD COLUMN IF NOT EXISTS has_bank_account boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_aadhaar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ration_card public.ration_card_type DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS email_alerts boolean DEFAULT true;

-- Scheme additions
ALTER TABLE public.schemes
  ADD COLUMN IF NOT EXISTS marital_statuses public.marital_status_type[],
  ADD COLUMN IF NOT EXISTS religions text[],
  ADD COLUMN IF NOT EXISTS farmer_types public.farmer_type[],
  ADD COLUMN IF NOT EXISTS max_land_acres numeric,
  ADD COLUMN IF NOT EXISTS requires_bank_account boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_aadhaar boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ration_cards public.ration_card_type[];

-- Allow inserting notifications from edge functions (service role bypasses, but we
-- also need users to NOT be able to forge them). Keep insert blocked for users.
-- Add a policy so the system (service role) is fine and add an INSERT-restricted
-- policy for cron functions that already use service role key. Nothing to change.

-- Index to look up upcoming deadlines fast
CREATE INDEX IF NOT EXISTS idx_schemes_active_deadline ON public.schemes (is_active, application_deadline);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
