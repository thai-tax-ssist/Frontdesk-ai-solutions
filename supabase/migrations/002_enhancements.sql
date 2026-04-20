-- ============================================================
-- 002: Enhancements — setup tracking, Anna config, follow-up,
--      GDPR, and call-log additions
-- ============================================================

-- ------------------------------------------------------------
-- business_profiles: new columns
-- ------------------------------------------------------------

ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS setup_completed        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS twilio_number_sid      TEXT,

  -- Anna AI configuration
  ADD COLUMN IF NOT EXISTS anna_voice             TEXT DEFAULT 'luna',
  ADD COLUMN IF NOT EXISTS anna_language          TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS anna_personality       TEXT DEFAULT 'professional',

  -- Follow-up SMS / email
  ADD COLUMN IF NOT EXISTS follow_up_sms_enabled  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS follow_up_email_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS follow_up_sms_template TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_email_template TEXT,

  -- GDPR consent
  ADD COLUMN IF NOT EXISTS gdpr_consent_date      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_consent      BOOLEAN DEFAULT FALSE;

-- ------------------------------------------------------------
-- call_logs: new columns
-- ------------------------------------------------------------

ALTER TABLE public.call_logs
  ADD COLUMN IF NOT EXISTS caller_email         TEXT,
  ADD COLUMN IF NOT EXISTS followup_sms_sent    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS followup_email_sent  BOOLEAN DEFAULT FALSE;

-- ------------------------------------------------------------
-- GDPR deletion audit log
-- (service-role only — no RLS so deleted users are still logged)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.gdpr_deletion_log (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID NOT NULL,
  email             TEXT,
  stripe_customer_id TEXT,
  deleted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS on this table — only accessible via service role key
ALTER TABLE public.gdpr_deletion_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Index on setup_completed for the webhook auto-setup check
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_business_profiles_setup
  ON public.business_profiles(setup_completed)
  WHERE setup_completed = FALSE;
