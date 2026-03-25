
-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- KNOWLEDGE BASE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id TEXT NOT NULL,          -- logical document identifier (e.g. filename/slug)
  document_title TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  embedding vector(1536),             -- text-embedding-3-small
  -- Broad SS Navigator taxonomy
  program TEXT,                       -- e.g. "Sebastian Strong Foundation", "St. Baldrick's"
  resource_type TEXT,                 -- e.g. "financial", "medical", "emotional", "navigation"
  category TEXT,                      -- aligns with resource_category enum
  source_url TEXT,
  applicable_states TEXT[],
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast vector similarity search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
  ON public.knowledge_base USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Index for document replacement
CREATE INDEX IF NOT EXISTS knowledge_base_document_id_idx 
  ON public.knowledge_base (document_id);

-- RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and navigators can manage knowledge base"
  ON public.knowledge_base FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

CREATE POLICY "Authenticated users can read knowledge base"
  ON public.knowledge_base FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- EVAL RUNS TABLE  (one row per batch evaluation run)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eval_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suite_id TEXT NOT NULL,
  suite_name TEXT NOT NULL,
  -- Run metadata for reproducibility
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5-20250929',
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  kb_version TEXT,                    -- snapshot label or date of KB used
  retrieval_threshold FLOAT NOT NULL DEFAULT 0.5,
  retrieval_count INTEGER NOT NULL DEFAULT 8,
  notes TEXT,
  run_by UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  -- Aggregated metrics
  total_prompts INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  grounded_count INTEGER DEFAULT 0,
  avg_latency_ms FLOAT,
  avg_response_length FLOAT,
  unique_sources_used INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.eval_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage eval runs"
  ON public.eval_runs FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

CREATE POLICY "Admins can view eval runs"
  ON public.eval_runs FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

-- ============================================================
-- EVAL RESULTS TABLE  (one row per prompt per run)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eval_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.eval_runs(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  category TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  -- Output
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  reply TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  suggested_prompts TEXT[],
  grounded_in_sources BOOLEAN,
  retrieved_chunks JSONB DEFAULT '[]'::jsonb,
  error_message TEXT,
  latency_ms INTEGER,
  response_length INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eval_results_run_id_idx ON public.eval_results (run_id);
CREATE INDEX IF NOT EXISTS eval_results_category_idx ON public.eval_results (category);

ALTER TABLE public.eval_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage eval results"
  ON public.eval_results FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

CREATE POLICY "Admins can view eval results"
  ON public.eval_results FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role]));

-- ============================================================
-- MATCH KNOWLEDGE BASE  RPC (vector similarity retrieval)
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_knowledge_base(
  query_embedding vector(1536),
  match_count INTEGER DEFAULT 8,
  similarity_threshold FLOAT DEFAULT 0.5,
  filter_category TEXT DEFAULT NULL,
  filter_program TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id TEXT,
  document_title TEXT,
  chunk_index INTEGER,
  content TEXT,
  program TEXT,
  resource_type TEXT,
  category TEXT,
  source_url TEXT,
  applicable_states TEXT[],
  tags TEXT[],
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.document_id,
    kb.document_title,
    kb.chunk_index,
    kb.content,
    kb.program,
    kb.resource_type,
    kb.category,
    kb.source_url,
    kb.applicable_states,
    kb.tags,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_base kb
  WHERE
    kb.embedding IS NOT NULL
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND (filter_program IS NULL OR kb.program = filter_program)
    AND 1 - (kb.embedding <=> query_embedding) > similarity_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- STORAGE BUCKET for knowledge base documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'knowledge-documents',
  'knowledge-documents',
  false,
  52428800,  -- 50MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can manage knowledge documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'knowledge-documents'
    AND has_any_role(auth.uid(), ARRAY['navigator'::user_role, 'admin'::user_role])
  );

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
