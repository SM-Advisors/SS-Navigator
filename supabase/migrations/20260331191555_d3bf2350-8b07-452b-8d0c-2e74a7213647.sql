ALTER TABLE public.eval_results ADD COLUMN IF NOT EXISTS full_system_prompt text;
ALTER TABLE public.eval_results ADD COLUMN IF NOT EXISTS user_messages jsonb;