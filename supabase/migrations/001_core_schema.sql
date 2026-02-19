-- ============================================
-- Migration 001: Core Schema
-- Users, profiles, audit logging
-- ============================================

-- Enum for treatment stages
CREATE TYPE public.treatment_stage AS ENUM (
  'newly_diagnosed',
  'in_treatment',
  'post_treatment',
  'survivorship',
  'relapse',
  'bereavement',
  'prefer_not_to_say'
);

-- Enum for user roles
CREATE TYPE public.user_role AS ENUM (
  'family_member',
  'navigator',
  'admin'
);

-- ============================================
-- Timestamp update function (reusable)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- User Profiles
-- ============================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  role user_role DEFAULT 'family_member',
  -- Child/patient info (all optional for privacy)
  child_first_name TEXT,
  diagnosis TEXT,
  diagnosis_date DATE,
  treatment_stage treatment_stage DEFAULT 'prefer_not_to_say',
  treatment_center TEXT,
  -- Location
  state TEXT,
  city TEXT,
  zip_code TEXT,
  -- Preferences
  priority_categories TEXT[] DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}',
  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  tour_completed BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Audit Log (HIPAA requirement)
-- ============================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at);

-- ============================================
-- RLS Policies: user_profiles
-- ============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Navigators can view all family profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('navigator', 'admin')
    )
  );

CREATE POLICY "Users can create their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: audit_log
-- ============================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own audit entries"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );
