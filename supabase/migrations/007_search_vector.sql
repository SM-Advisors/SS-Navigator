-- ============================================
-- Migration 007: Add search_vector column to resources
-- Fixes full-text search used by useResources hook and ai-sherpa Edge Function
-- ============================================

-- Add the generated search_vector column
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english',
        COALESCE(title, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(long_description, '') || ' ' ||
        COALESCE(organization_name, '') || ' ' ||
        COALESCE(subcategory, '')
      )
    ) STORED;

-- Create GIN index on the generated column for fast search
DROP INDEX IF EXISTS idx_resources_search;
CREATE INDEX idx_resources_search_vector ON public.resources USING gin(search_vector);
