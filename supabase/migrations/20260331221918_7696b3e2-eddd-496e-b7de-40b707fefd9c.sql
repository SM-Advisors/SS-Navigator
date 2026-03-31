
CREATE OR REPLACE FUNCTION public.resources_within_radius(
  user_lat double precision,
  user_lng double precision,
  radius_miles double precision,
  fallback_state text DEFAULT NULL,
  exclude_national boolean DEFAULT false
)
RETURNS TABLE(resource_id uuid, distance_miles double precision)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id AS resource_id,
    3959.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(r.latitude)) *
        cos(radians(r.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(r.latitude))
      ))
    ) AS distance_miles
  FROM public.resources r
  WHERE r.is_active = true
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    AND 3959.0 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(user_lat)) * cos(radians(r.latitude)) *
        cos(radians(r.longitude) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(r.latitude))
      ))
    ) <= radius_miles

  UNION ALL

  SELECT r.id AS resource_id, 9999.0 AS distance_miles
  FROM public.resources r
  WHERE r.is_active = true
    AND r.latitude IS NULL
    AND fallback_state IS NOT NULL
    AND (
      r.applicable_states @> ARRAY[fallback_state]
      OR (NOT exclude_national AND r.applicable_states = '{}'::text[])
    );
END;
$$;
