-- Remove duplicate resources, keeping only the first inserted copy
DELETE FROM resources a
USING resources b
WHERE a.id > b.id
  AND a.title = b.title
  AND a.organization_name = b.organization_name;