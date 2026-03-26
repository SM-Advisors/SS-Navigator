-- Add full-text search vector column to knowledge_base
ALTER TABLE public.knowledge_base ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search_vector
ON public.knowledge_base USING gin(search_vector);

-- Trigger to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION public.knowledge_base_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.document_title, '') || ' ' ||
    coalesce(NEW.content, '') || ' ' ||
    coalesce(NEW.program, '') || ' ' ||
    coalesce(NEW.category, '') || ' ' ||
    coalesce(NEW.resource_type, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.applicable_states, ' '), '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS knowledge_base_search_vector_trigger ON public.knowledge_base;
CREATE TRIGGER knowledge_base_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.knowledge_base_search_vector_update();

-- Full-text search matching function (replaces vector similarity)
CREATE OR REPLACE FUNCTION public.match_knowledge_base_fts(
  query_text text,
  match_count integer DEFAULT 8,
  filter_category text DEFAULT NULL,
  filter_program text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  document_id text,
  document_title text,
  chunk_index integer,
  content text,
  program text,
  resource_type text,
  category text,
  source_url text,
  applicable_states text[],
  tags text[],
  metadata jsonb,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tsquery_val tsquery;
BEGIN
  tsquery_val := plainto_tsquery('english', query_text);

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
    ts_rank_cd(kb.search_vector, tsquery_val)::double precision AS similarity
  FROM public.knowledge_base kb
  WHERE
    kb.search_vector @@ tsquery_val
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND (filter_program IS NULL OR kb.program = filter_program)
  ORDER BY ts_rank_cd(kb.search_vector, tsquery_val) DESC
  LIMIT match_count;
END;
$$;