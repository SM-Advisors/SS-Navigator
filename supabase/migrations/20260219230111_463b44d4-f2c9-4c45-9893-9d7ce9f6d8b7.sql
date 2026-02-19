
-- =============================================
-- FIX 1: RLS infinite recursion on user_profiles
-- Create a security definer function to check roles without triggering RLS
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles user_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Navigators can view all family profiles" ON public.user_profiles;

-- Recreate with security definer function (no recursion)
CREATE POLICY "Navigators can view all family profiles"
ON public.user_profiles
FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

-- Also fix other policies that reference user_profiles to use the function
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

DROP POLICY IF EXISTS "Admins can manage channels" ON public.community_channels;
CREATE POLICY "Admins can manage channels"
ON public.community_channels FOR ALL
USING (public.has_role(auth.uid(), 'admin'::user_role));

DROP POLICY IF EXISTS "Admins can moderate messages" ON public.community_messages;
CREATE POLICY "Admins can moderate messages"
ON public.community_messages FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

DROP POLICY IF EXISTS "Navigators and admins can view all submissions" ON public.contact_submissions;
CREATE POLICY "Navigators and admins can view all submissions"
ON public.contact_submissions FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

DROP POLICY IF EXISTS "Navigators can update submissions" ON public.contact_submissions;
CREATE POLICY "Navigators can update submissions"
ON public.contact_submissions FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

DROP POLICY IF EXISTS "Admins and navigators can manage resources" ON public.resources;
CREATE POLICY "Admins and navigators can manage resources"
ON public.resources FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

-- =============================================
-- FIX 2: Missing trigger for auto-creating user profiles on signup
-- =============================================
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FIX 3: Seed resources table
-- =============================================
INSERT INTO public.resources (
  title, description, category, organization_name,
  organization_url, organization_phone, organization_email,
  applicable_states, applicable_stages, applicable_diagnoses, tags,
  is_featured, is_active, is_crisis_resource, priority_order
) VALUES
(
  'Alex''s Lemonade Stand Foundation',
  'Provides financial assistance to families of children with cancer to help cover travel expenses, lodging, and other treatment-related costs through their Childhood Cancer Research Fund and Family Support programs.',
  'financial'::public.resource_category,
  'Alex''s Lemonade Stand Foundation',
  'https://www.alexslemonade.org',
  '866-333-1213',
  'info@alexslemonade.org',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['travel', 'lodging', 'financial assistance', 'grants'],
  true, true, false, 10
),
(
  'Family Reach — Financial Navigation for Cancer',
  'Connects cancer patients and their families with financial assistance programs, financial counseling, and emergency funds to cover treatment-related costs including food, housing, and utilities.',
  'financial'::public.resource_category,
  'Family Reach',
  'https://familyreach.org',
  '617-273-2500',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['financial counseling', 'emergency funds', 'housing', 'utilities'],
  true, true, false, 10
),
(
  'Children''s Cancer Fund — Patient Assistance',
  'Provides direct financial assistance to families of children with cancer to help with medical costs, transportation, lodging, and other non-medical expenses during treatment.',
  'financial'::public.resource_category,
  'Children''s Cancer Fund',
  'https://www.childrenscancerfund.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['grants', 'direct assistance', 'transportation'],
  false, true, false, 8
),
(
  'Patient Advocate Foundation — Co-Pay Relief',
  'Offers co-pay assistance to insured patients who financially qualify. Helps with insurance-related issues, negotiating with employers, and resolving insurance denials.',
  'financial'::public.resource_category,
  'Patient Advocate Foundation',
  'https://www.patientadvocate.org',
  '800-532-5274',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['co-pay relief', 'insurance', 'denials'],
  false, true, false, 9
),
(
  'Ronald McDonald House Charities',
  'Provides housing and family support to families of seriously ill children receiving medical treatment. Houses near children''s hospitals let families stay together during treatment.',
  'financial'::public.resource_category,
  'Ronald McDonald House Charities',
  'https://www.rmhc.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['housing', 'lodging', 'near hospital', 'family support'],
  true, true, false, 10
),
(
  'Joe DiMaggio Children''s Hospital Foundation — Financial Aid',
  'Provides financial assistance to families of pediatric cancer patients at Joe DiMaggio Children''s Hospital in South Florida.',
  'financial'::public.resource_category,
  'Joe DiMaggio Children''s Hospital Foundation',
  'https://www.jdch.com',
  NULL, NULL,
  ARRAY['FL'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['florida', 'south florida', 'direct assistance'],
  false, true, false, 7
),
(
  'Pediatric Cancer Research Foundation — Care Fund',
  'Provides grants to families to cover non-medical costs associated with childhood cancer treatment, including transportation, lodging, and household expenses.',
  'financial'::public.resource_category,
  'Pediatric Cancer Research Foundation',
  'https://pcrf-kids.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['grants', 'non-medical costs'],
  false, true, false, 7
),
(
  'Children''s Oncology Group — Clinical Trials',
  'The world''s largest organization devoted exclusively to childhood and adolescent cancer research. Find open clinical trials at COG-member institutions near you.',
  'medical'::public.resource_category,
  'Children''s Oncology Group',
  'https://www.childrensoncologygroup.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['clinical trials', 'research', 'oncology', 'treatment'],
  true, true, false, 10
),
(
  'CureSearch for Children''s Cancer',
  'Funds pediatric cancer research and provides resources for patients and families to understand treatment options, clinical trials, and navigate the healthcare system.',
  'medical'::public.resource_category,
  'CureSearch for Children''s Cancer',
  'https://curesearch.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['research', 'clinical trials', 'treatment information'],
  false, true, false, 9
),
(
  'Pediatric Brain Tumor Foundation — Medical Resources',
  'Provides educational resources, clinical trial matching, and community support for families of children with brain tumors.',
  'medical'::public.resource_category,
  'Pediatric Brain Tumor Foundation',
  'https://www.pbtfus.org',
  '800-253-6530',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['brain tumor', 'medulloblastoma', 'glioma', 'PNET'], ARRAY['brain tumor', 'PBTF', 'clinical trials'],
  false, true, false, 8
),
(
  'National Children''s Cancer Society — Medical Information',
  'Provides information about childhood cancers, treatment options, and resources for families navigating a new or ongoing diagnosis.',
  'medical'::public.resource_category,
  'National Children''s Cancer Society',
  'https://www.thenccs.org',
  '314-241-1600',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['diagnosis information', 'treatment resources'],
  false, true, false, 8
),
(
  'CancerCare — Free Counseling & Support Groups',
  'Provides free, professional support services including individual counseling, support groups, and educational workshops for cancer patients and families, including childhood cancer.',
  'emotional'::public.resource_category,
  'CancerCare',
  'https://www.cancercare.org',
  '800-813-4673',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['counseling', 'support groups', 'mental health', 'free'],
  true, true, false, 10
),
(
  'American Childhood Cancer Organization — Support Groups',
  'Connects families with peer support through online and local support groups. ACCO''s family network provides community for parents and caregivers of children with cancer.',
  'emotional'::public.resource_category,
  'American Childhood Cancer Organization',
  'https://www.acco.org',
  '855-858-2226',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['support groups', 'peer support', 'community'],
  true, true, false, 9
),
(
  'Kids Konnected — Support for Kids with a Parent with Cancer',
  'Provides a caring support network for kids and teens who have a parent or loved one with cancer. Offers peer support, hotlines, and educational programs.',
  'emotional'::public.resource_category,
  'Kids Konnected',
  'https://www.kidskonnected.org',
  '800-899-2866',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['peer support', 'children', 'teens', 'parent cancer'],
  false, true, false, 7
),
(
  'Stupid Cancer — Young Adult Support',
  'Focuses on young adults impacted by cancer, offering support communities, wellness programs, and advocacy. Relevant for teenage patients and siblings.',
  'emotional'::public.resource_category,
  'Stupid Cancer',
  'https://stupidcancer.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY['in_treatment', 'survivorship'], ARRAY[]::TEXT[], ARRAY['young adults', 'teens', 'community', 'advocacy'],
  false, true, false, 7
),
(
  'Kids'' Meals on Wheels — Childhood Cancer',
  'Many local Meals on Wheels chapters provide meal delivery to families with seriously ill children. Reduces the burden of cooking during intensive treatment.',
  'practical'::public.resource_category,
  'Meals on Wheels America',
  'https://www.mealsonwheelsamerica.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['meals', 'food', 'delivery', 'local programs'],
  false, true, false, 7
),
(
  'Cleaning For A Reason — Free House Cleaning',
  'Partners with house cleaning companies to provide free cleanings for cancer patients. Helps families maintain a safe, clean environment during treatment.',
  'practical'::public.resource_category,
  'Cleaning For A Reason Foundation',
  'https://cleaningforareason.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['house cleaning', 'free services', 'home'],
  false, true, false, 8
),
(
  'CaringBridge — Free Patient Websites',
  'Free personalized health journals that keep family and friends informed. Reduces the burden of updating everyone while allowing families to focus on care.',
  'practical'::public.resource_category,
  'CaringBridge',
  'https://www.caringbridge.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['communication', 'family updates', 'journal'],
  false, true, false, 7
),
(
  'National Patient Travel Center — Transportation Assistance',
  'Helps arrange free air transportation for medical treatment through a network of volunteer pilots and commercial airline programs.',
  'practical'::public.resource_category,
  'National Patient Travel Center',
  'https://www.patienttravel.org',
  '800-296-1217',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['transportation', 'flights', 'travel assistance'],
  false, true, false, 8
),
(
  'Back2School — School Re-Entry Guide for Childhood Cancer',
  'Comprehensive resources from CureSearch to help families prepare for school re-entry after cancer treatment, including IEP guidance, accommodation letters, and teacher education.',
  'educational'::public.resource_category,
  'CureSearch for Children''s Cancer',
  'https://curesearch.org/school-and-cancer',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY['in_treatment', 'post_treatment', 'survivorship'], ARRAY[]::TEXT[], ARRAY['school re-entry', 'IEP', '504 plan', 'education'],
  false, true, false, 9
),
(
  'Hospital Homebound Education Programs',
  'Most states require school districts to provide homebound instruction when a student cannot attend school due to medical necessity. Contact your district for specifics.',
  'educational'::public.resource_category,
  'U.S. Department of Education',
  'https://www.ed.gov',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['homebound', 'education', 'in-home tutoring', 'IEP'],
  false, true, false, 8
),
(
  'Educating Children with Cancer — School Accommodation Guide',
  'Practical guide for parents on advocating for educational accommodations including 504 plans, IEPs, and classroom modifications for children with cancer.',
  'educational'::public.resource_category,
  'American Childhood Cancer Organization',
  'https://www.acco.org/school',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['accommodations', '504 plan', 'IEP', 'school support'],
  false, true, false, 8
),
(
  'FMLA — Family Medical Leave Act Guide',
  'The FMLA allows eligible employees to take up to 12 weeks of unpaid, job-protected leave per year for family medical situations, including a child''s serious health condition.',
  'legal'::public.resource_category,
  'U.S. Department of Labor',
  'https://www.dol.gov/agencies/whd/fmla',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['FMLA', 'job protection', 'employment', 'leave'],
  false, true, false, 9
),
(
  'Patient Advocate Foundation — Legal Case Managers',
  'Free case management services to help patients with insurance issues, employment problems related to their medical condition, and access to care.',
  'legal'::public.resource_category,
  'Patient Advocate Foundation',
  'https://www.patientadvocate.org',
  '800-532-5274',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['legal aid', 'insurance appeals', 'employment law'],
  false, true, false, 9
),
(
  'ADA & Disability Rights for Children with Cancer',
  'Under the ADA and Section 504, children with cancer may qualify for protections in public schools and other settings. Know your family''s rights.',
  'legal'::public.resource_category,
  'Disability Rights Advocates',
  'https://dralegal.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['ADA', 'disability rights', '504', 'school rights'],
  false, true, false, 7
),
(
  'Childhood Cancer Cafe — Online Community',
  'An online support community specifically for parents and families of children with cancer. Share experiences, find support, and connect with those who truly understand.',
  'community'::public.resource_category,
  'Childhood Cancer Cafe',
  'https://childhoodcancercafe.com',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['online community', 'peer support', 'parents'],
  false, true, false, 7
),
(
  'ACCO — Kids'' Online Community',
  'American Childhood Cancer Organization''s online network connecting kids and teens with cancer or in remission with peers who understand the journey.',
  'community'::public.resource_category,
  'American Childhood Cancer Organization',
  'https://www.acco.org/community',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['children', 'teens', 'peer connection', 'online'],
  false, true, false, 7
),
(
  'Sebastian Strong — Hope Navigator Program',
  'FREE nurse navigator services for families of children with cancer. Our navigators provide personalized guidance through diagnosis, treatment, and beyond. No appointment needed.',
  'navigation'::public.resource_category,
  'Sebastian Strong Foundation',
  'https://sebastianstrong.org',
  '305-846-7611',
  'info@sebastianstrong.org',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['navigator', 'nurse navigator', 'free', 'personalized support'],
  true, true, false, 10
),
(
  'National Cancer Information Center — ACS Navigators',
  'The American Cancer Society provides navigation services to help patients and families connect with local resources, programs, and services.',
  'navigation'::public.resource_category,
  'American Cancer Society',
  'https://www.cancer.org',
  '800-227-2345',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['navigation', 'ACS', 'information', 'local resources'],
  false, true, false, 8
),
(
  'Children''s Oncology Group — Long-Term Follow-Up Guidelines',
  'Comprehensive guidelines for the long-term follow-up care of childhood cancer survivors. Helps families understand potential late effects and recommended screenings.',
  'survivorship'::public.resource_category,
  'Children''s Oncology Group',
  'https://www.survivorshipguidelines.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY['post_treatment', 'survivorship'], ARRAY[]::TEXT[], ARRAY['late effects', 'follow-up care', 'screenings', 'survivorship guidelines'],
  true, true, false, 9
),
(
  'Stupid Cancer — Survivorship Resources',
  'Resources for young adult cancer survivors navigating life after cancer — employment, relationships, health insurance, and mental health.',
  'survivorship'::public.resource_category,
  'Stupid Cancer',
  'https://stupidcancer.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY['survivorship'], ARRAY[]::TEXT[], ARRAY['survivorship', 'young adults', 'life after cancer'],
  false, true, false, 7
),
(
  'Livestrong — Survivorship Care Planning',
  'Provides survivorship care plans, fertility preservation resources, and programs to help cancer survivors thrive after treatment.',
  'survivorship'::public.resource_category,
  'Livestrong Foundation',
  'https://www.livestrong.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY['post_treatment', 'survivorship'], ARRAY[]::TEXT[], ARRAY['care plan', 'fertility', 'life after cancer'],
  false, true, false, 8
),
(
  'Sibling Support Project',
  'Dedicated to the interests of brothers and sisters of children with special health and developmental needs. Offers Sibshops — workshop programs for siblings aged 8-13.',
  'sibling_support'::public.resource_category,
  'Sibling Support Project',
  'https://www.siblingsupport.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['siblings', 'Sibshops', 'workshops', 'peer support'],
  true, true, false, 9
),
(
  'ACCO — Sibling Resources',
  'Resources to help parents explain cancer to siblings, support their emotional needs, and find age-appropriate ways to involve siblings in the family''s journey.',
  'sibling_support'::public.resource_category,
  'American Childhood Cancer Organization',
  'https://www.acco.org/siblings',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['siblings', 'explaining cancer', 'family support'],
  false, true, false, 8
),
(
  'SuperSibs — Recognition & Support for Siblings',
  'Honors, assists, and encourages siblings of children with cancer through recognition programs, pen pal networks, and scholarship programs.',
  'sibling_support'::public.resource_category,
  'SuperSibs (merged with ACCO)',
  'https://www.acco.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['siblings', 'recognition', 'scholarships', 'pen pal'],
  false, true, false, 8
),
(
  '988 Suicide & Crisis Lifeline',
  'Call or text 988 to reach the Suicide and Crisis Lifeline, available 24/7. Free, confidential support for people in distress and prevention resources for you or your loved ones.',
  'emotional'::public.resource_category,
  'SAMHSA / 988 Suicide & Crisis Lifeline',
  'https://988lifeline.org',
  '988',
  NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['crisis', 'suicide prevention', 'mental health emergency', '24/7'],
  true, true, true, 10
),
(
  'Crisis Text Line',
  'Text HOME to 741741 to connect with a Crisis Counselor. Free, 24/7 support for people in crisis. Text-based support is available for those who prefer not to call.',
  'emotional'::public.resource_category,
  'Crisis Text Line',
  'https://www.crisistextline.org',
  NULL, NULL,
  ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['crisis', 'text support', '24/7', 'mental health emergency'],
  true, true, true, 10
);
