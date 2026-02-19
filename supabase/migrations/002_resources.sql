-- ============================================
-- Migration 002: Resource Database
-- ============================================

CREATE TYPE public.resource_category AS ENUM (
  'financial',
  'medical',
  'emotional',
  'practical',
  'legal',
  'educational',
  'community',
  'navigation',
  'survivorship',
  'sibling_support'
);

CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category resource_category NOT NULL,
  subcategory TEXT,
  organization_name TEXT NOT NULL,
  organization_url TEXT,
  organization_phone TEXT,
  organization_email TEXT,
  applicable_states TEXT[] DEFAULT '{}',
  applicable_stages TEXT[] DEFAULT '{}',
  applicable_diagnoses TEXT[] DEFAULT '{}',
  age_range_min INTEGER,
  age_range_max INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_crisis_resource BOOLEAN DEFAULT false,
  priority_order INTEGER DEFAULT 0,
  application_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ
);

CREATE INDEX idx_resources_search ON public.resources
  USING gin(to_tsvector('english', title || ' ' || description || ' ' || COALESCE(long_description, '')));

CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_active ON public.resources(is_active);
CREATE INDEX idx_resources_featured ON public.resources(is_featured) WHERE is_featured = true;
CREATE INDEX idx_resources_crisis ON public.resources(is_crisis_resource) WHERE is_crisis_resource = true;

-- ============================================
-- Saved/Bookmarked Resources
-- ============================================
CREATE TABLE public.saved_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- RLS: resources (public read, admin write)
-- ============================================
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins and navigators can manage resources"
  ON public.resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('navigator', 'admin')
    )
  );

-- ============================================
-- RLS: saved_resources
-- ============================================
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved resources"
  ON public.saved_resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save resources"
  ON public.saved_resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved resources"
  ON public.saved_resources FOR DELETE
  USING (auth.uid() = user_id);
