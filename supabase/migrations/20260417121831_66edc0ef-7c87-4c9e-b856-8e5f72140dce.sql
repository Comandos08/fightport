-- Lista global de atletas com filtros
CREATE OR REPLACE FUNCTION public.admin_list_practitioners(
  p_search text DEFAULT NULL,
  p_school_id uuid DEFAULT NULL,
  p_martial_art text DEFAULT NULL,
  p_belt text DEFAULT NULL,
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_sort text DEFAULT 'created_at',
  p_dir text DEFAULT 'desc',
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  fp_id text,
  first_name text,
  last_name text,
  cpf text,
  current_belt text,
  martial_art text,
  school_id uuid,
  school_name text,
  achievements_count bigint,
  created_at timestamptz,
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
      p.id, p.fp_id, p.first_name, p.last_name, p.cpf, p.current_belt,
      p.martial_art, p.school_id,
      s.name AS school_name,
      (SELECT COUNT(*) FROM public.achievements a WHERE a.practitioner_id = p.id) AS achievements_count,
      p.created_at
    FROM public.practitioners p
    LEFT JOIN public.schools s ON s.id = p.school_id
  ),
  filtered AS (
    SELECT * FROM base b
    WHERE
      (p_search IS NULL OR p_search = '' OR
        b.first_name ILIKE '%' || p_search || '%' OR
        b.last_name ILIKE '%' || p_search || '%' OR
        (b.first_name || ' ' || b.last_name) ILIKE '%' || p_search || '%' OR
        b.fp_id ILIKE '%' || p_search || '%' OR
        COALESCE(b.cpf, '') ILIKE '%' || p_search || '%')
      AND (p_school_id IS NULL OR b.school_id = p_school_id)
      AND (p_martial_art IS NULL OR p_martial_art = '' OR b.martial_art = p_martial_art)
      AND (p_belt IS NULL OR p_belt = '' OR b.current_belt = p_belt)
      AND (p_date_from IS NULL OR b.created_at >= p_date_from)
      AND (p_date_to IS NULL OR b.created_at <= p_date_to)
  ),
  counted AS (SELECT COUNT(*) AS total FROM filtered)
  SELECT
    f.id, f.fp_id, f.first_name, f.last_name, f.cpf, f.current_belt,
    f.martial_art, f.school_id, f.school_name, f.achievements_count, f.created_at,
    (SELECT total FROM counted) AS total_count
  FROM filtered f
  ORDER BY
    CASE WHEN p_sort = 'name' AND p_dir = 'asc' THEN f.first_name END ASC,
    CASE WHEN p_sort = 'name' AND p_dir = 'desc' THEN f.first_name END DESC,
    CASE WHEN p_sort = 'fp_id' AND p_dir = 'asc' THEN f.fp_id END ASC,
    CASE WHEN p_sort = 'fp_id' AND p_dir = 'desc' THEN f.fp_id END DESC,
    CASE WHEN p_sort = 'belt' AND p_dir = 'asc' THEN f.current_belt END ASC,
    CASE WHEN p_sort = 'belt' AND p_dir = 'desc' THEN f.current_belt END DESC,
    CASE WHEN p_sort = 'achievements' AND p_dir = 'asc' THEN f.achievements_count END ASC,
    CASE WHEN p_sort = 'achievements' AND p_dir = 'desc' THEN f.achievements_count END DESC,
    CASE WHEN p_sort = 'created_at' AND p_dir = 'asc' THEN f.created_at END ASC,
    CASE WHEN p_sort = 'created_at' AND p_dir = 'desc' THEN f.created_at END DESC,
    f.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Detalhe do atleta
CREATE OR REPLACE FUNCTION public.admin_get_practitioner(p_practitioner_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT jsonb_build_object(
    'practitioner', to_jsonb(p.*),
    'school', (SELECT jsonb_build_object('id', s.id, 'name', s.name, 'martial_art', s.martial_art, 'city', s.city, 'state', s.state)
               FROM public.schools s WHERE s.id = p.school_id),
    'achievements_count', (SELECT COUNT(*) FROM public.achievements a WHERE a.practitioner_id = p.id)
  ) INTO v
  FROM public.practitioners p
  WHERE p.id = p_practitioner_id;

  RETURN v;
END;
$$;

-- Graduações do atleta (somente leitura)
CREATE OR REPLACE FUNCTION public.admin_practitioner_achievements(p_practitioner_id uuid)
RETURNS TABLE(
  id uuid,
  belt text,
  degree int,
  graduation_date date,
  graduated_by text,
  hash text,
  notes text,
  created_at timestamptz,
  school_id uuid,
  school_name text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT a.id, a.belt, a.degree, a.graduation_date, a.graduated_by, a.hash, a.notes, a.created_at,
         a.school_id, s.name AS school_name
  FROM public.achievements a
  LEFT JOIN public.schools s ON s.id = a.school_id
  WHERE a.practitioner_id = p_practitioner_id
  ORDER BY a.graduation_date DESC, a.created_at DESC;
END;
$$;

-- Edição de atleta com audit log por campo
CREATE OR REPLACE FUNCTION public.admin_update_practitioner(
  p_practitioner_id uuid,
  p_changes jsonb,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current public.practitioners%ROWTYPE;
  k text;
  v_new text;
  v_old text;
  v_allowed text[] := ARRAY['first_name','last_name','cpf','birth_date','gender','father_name','mother_name','photo_url','current_belt','martial_art'];
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;
  IF p_changes IS NULL OR p_changes = '{}'::jsonb THEN
    RAISE EXCEPTION 'No changes provided';
  END IF;

  SELECT * INTO v_current FROM public.practitioners WHERE id = p_practitioner_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Practitioner not found'; END IF;

  FOR k IN SELECT jsonb_object_keys(p_changes) LOOP
    IF NOT (k = ANY(v_allowed)) THEN
      RAISE EXCEPTION 'Field % is not editable', k;
    END IF;

    v_new := p_changes ->> k;
    EXECUTE format('SELECT ($1).%I::text', k) INTO v_old USING v_current;

    IF v_old IS DISTINCT FROM v_new THEN
      EXECUTE format('UPDATE public.practitioners SET %I = $1, updated_at = NOW() WHERE id = $2', k)
        USING v_new, p_practitioner_id;

      INSERT INTO public.admin_audit_log (admin_id, action, target_type, target_id, metadata)
      VALUES (auth.uid(), 'practitioner.update', 'practitioner', p_practitioner_id::text,
              jsonb_build_object('field', k, 'old_value', v_old, 'new_value', v_new, 'reason', p_reason));
    END IF;
  END LOOP;
END;
$$;

-- Log genérico (ex.: revelar dados sensíveis)
CREATE OR REPLACE FUNCTION public.admin_log_action(
  p_action text,
  p_target_type text,
  p_target_id text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_action IS NULL OR length(trim(p_action)) = 0 THEN
    RAISE EXCEPTION 'Action is required';
  END IF;
  INSERT INTO public.admin_audit_log (admin_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;