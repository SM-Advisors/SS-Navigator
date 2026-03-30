-- Saved eval comparisons
CREATE TABLE public.eval_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_run_id uuid NOT NULL REFERENCES public.eval_runs(id) ON DELETE CASCADE,
  comp_run_id uuid NOT NULL REFERENCES public.eval_runs(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  notes text,
  regressions integer NOT NULL DEFAULT 0,
  improvements integer NOT NULL DEFAULT 0,
  grounding_changes integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eval_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage eval comparisons"
  ON public.eval_comparisons FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

CREATE POLICY "Admins can view eval comparisons"
  ON public.eval_comparisons FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));
