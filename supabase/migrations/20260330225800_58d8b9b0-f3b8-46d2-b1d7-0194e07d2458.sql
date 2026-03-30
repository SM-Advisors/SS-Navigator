CREATE OR REPLACE FUNCTION public.match_knowledge_base_fts(
  query_text text, 
  match_count integer DEFAULT 8, 
  filter_category text DEFAULT NULL::text, 
  filter_program text DEFAULT NULL::text
)
RETURNS TABLE(
  id uuid, document_id text, document_title text, chunk_index integer, 
  content text, program text, resource_type text, category text, 
  source_url text, applicable_states text[], tags text[], 
  metadata jsonb, similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tsquery_and tsquery;
  tsquery_or tsquery;
  chosen_query tsquery;
  and_count integer;
BEGIN
  tsquery_and := plainto_tsquery('english', query_text);
  
  SELECT count(*) INTO and_count
  FROM public.knowledge_base kb
  WHERE kb.search_vector @@ tsquery_and
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND (filter_program IS NULL OR kb.program = filter_program);
  
  IF and_count >= 3 THEN
    chosen_query := tsquery_and;
  ELSE
    SELECT string_agg(lexeme, ' | ')::tsquery INTO tsquery_or
    FROM (
      SELECT unnest(tsvector_to_array(to_tsvector('english', query_text))) as lexeme
    ) words
    WHERE length(lexeme) >= 3;
    
    IF tsquery_or IS NOT NULL THEN
      chosen_query := tsquery_or;
    ELSE
      chosen_query := tsquery_and;
    END IF;
  END IF;

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
    ts_rank_cd(kb.search_vector, chosen_query)::double precision AS similarity
  FROM public.knowledge_base kb
  WHERE
    kb.search_vector @@ chosen_query
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND (filter_program IS NULL OR kb.program = filter_program)
  ORDER BY ts_rank_cd(kb.search_vector, chosen_query) DESC
  LIMIT match_count;
END;
$$;