-- ============================================
-- Migration 004: Community Hub
-- ============================================

CREATE TABLE public.community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES public.community_messages(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.channel_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.community_channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_community_messages_channel ON public.community_messages(channel_id);
CREATE INDEX idx_community_messages_created ON public.community_messages(created_at);
CREATE INDEX idx_community_messages_user ON public.community_messages(user_id);

CREATE TRIGGER update_community_messages_updated_at
  BEFORE UPDATE ON public.community_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Seed default channels
-- ============================================
INSERT INTO public.community_channels (name, slug, description, icon, category, display_order, is_default) VALUES
  ('Introductions', 'introductions', 'Welcome! Tell us a little about your family', 'Hand', 'general', 0, true),
  ('Newly Diagnosed', 'newly-diagnosed', 'Support and information for families who have recently received a diagnosis', 'Heart', 'support', 1, true),
  ('Financial Help', 'financial-help', 'Share resources and tips for managing the financial burden of treatment', 'DollarSign', 'practical', 2, true),
  ('Treatment Questions', 'treatment-questions', 'Discuss treatment experiences, questions, and share what has helped', 'Stethoscope', 'support', 3, true),
  ('Survivorship', 'survivorship', 'For families navigating life after treatment ends', 'Sun', 'support', 4, true),
  ('Siblings', 'siblings', 'Resources and support for brothers and sisters', 'Users', 'support', 5, true),
  ('Daily Life & Practical Tips', 'daily-life', 'Managing day-to-day challenges during treatment', 'Home', 'practical', 6, true),
  ('School & Education', 'school-education', 'IEPs, 504 plans, homebound education, and school re-entry', 'GraduationCap', 'practical', 7, false),
  ('General Chat', 'general', 'Open conversation and community connection', 'MessageSquare', 'general', 8, true);

-- ============================================
-- Enable Supabase Realtime for community_messages
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- ============================================
-- RLS: community_channels
-- ============================================
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active channels"
  ON public.community_channels FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage channels"
  ON public.community_channels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- ============================================
-- RLS: community_messages
-- ============================================
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view non-deleted messages"
  ON public.community_messages FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Authenticated users can send messages"
  ON public.community_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own messages"
  ON public.community_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate messages"
  ON public.community_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid() AND up.role IN ('navigator', 'admin')
    )
  );

-- ============================================
-- RLS: channel_memberships
-- ============================================
ALTER TABLE public.channel_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own memberships"
  ON public.channel_memberships FOR ALL
  USING (auth.uid() = user_id);
