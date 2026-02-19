
-- Clean up all user-related data
DELETE FROM public.ai_messages;
DELETE FROM public.ai_conversations;
DELETE FROM public.audit_log;
DELETE FROM public.channel_memberships;
DELETE FROM public.community_messages;
DELETE FROM public.contact_submissions;
DELETE FROM public.saved_resources;
DELETE FROM public.user_roles;
DELETE FROM public.user_profiles;

-- Remove all auth users
DELETE FROM auth.users;
