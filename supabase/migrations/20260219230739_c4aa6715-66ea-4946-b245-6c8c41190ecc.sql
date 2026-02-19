-- Proper dedup: keep the earliest created row per title+org
DELETE FROM resources
WHERE id NOT IN (
  SELECT DISTINCT ON (title, organization_name) id
  FROM resources
  ORDER BY title, organization_name, created_at ASC
);