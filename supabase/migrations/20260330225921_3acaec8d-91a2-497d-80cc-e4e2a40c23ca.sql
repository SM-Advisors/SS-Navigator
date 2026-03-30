-- Add search_vector column to resources
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast FTS
CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON public.resources USING gin(search_vector);

-- Populate existing rows
UPDATE public.resources SET search_vector = to_tsvector('english', 
  coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(organization_name,'') || ' ' || coalesce(array_to_string(tags, ' '), '')
);

-- Create or replace trigger to keep it updated
CREATE OR REPLACE FUNCTION public.resources_search_vector_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,'') || ' ' || coalesce(NEW.organization_name,'') || ' ' || coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_resources_search_vector ON public.resources;
CREATE TRIGGER trg_resources_search_vector
  BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.resources_search_vector_update();