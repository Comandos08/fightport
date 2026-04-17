CREATE OR REPLACE FUNCTION public.admin_list_achievements(
  p_search text DEFAULT NULL,
  p_school_id uuid DEFAULT NULL,
  p_martial_art text DEFAULT NULL,
  p_belt text DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  created_at timestamptz,
  graduation_date date,
  belt text,
  degree int,
  graduated_by text,
  hash text,
  practitioner_id uuid,
  practitioner_name text,
  fp_id text,
  martial_art text,
  school_id uuid,
  school_name text,
  total_count bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      a.id, a.created_at, a.graduation_date, a.belt, a.degree, a.graduated_by, a.hash,
      a.practitioner_id,
      (p.first_name || ' ' || p.last_name) AS practitioner_name,
      p.fp_id,
      COALESCE(p.martial_art, s.martial_art) AS martial_art,
      a.school_id, s.name AS school_name
    FROM public.achievements a
    LEFT JOIN public.practitioners p ON p.id = a.practitioner_id
    LEFT JOIN public.schools s ON s.id = a.school_id
  ),
  filtered AS (
    SELECT * FROM base b
    WHERE
      (p_search IS NULL OR p_search = '' OR
        b.practitioner_name ILIKE '%' || p_search || '%' OR
        b.fp_id ILIKE '%' || p_search || '%' OR
        b.hash ILIKE '%' || p_search || '%')
      AND (p_school_id IS NULL OR b.school_id = p_school_id)
      AND (p_martial_art IS NULL OR p_martial_art = '' OR b.martial_art = p_martial_art)
      AND (p_belt IS NULL OR p_belt = '' OR b.belt = p_belt)
      AND (p_date_from IS NULL OR b.created_at >= p_date_from)
      AND (p_date_to IS NULL OR b.created_at <= p_date_to)
  ),
  counted AS (SELECT COUNT(*) AS total FROM filtered)
  SELECT
    f.id, f.created_at, f.graduation_date, f.belt, f.degree, f.graduated_by, f.hash,
    f.practitioner_id, f.practitioner_name, f.fp_id, f.martial_art,
    f.school_id, f.school_name,
    (SELECT total FROM counted) AS total_count
  FROM filtered f
  ORDER BY f.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;