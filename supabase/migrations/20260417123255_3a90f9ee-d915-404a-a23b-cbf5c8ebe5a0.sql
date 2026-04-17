-- Bloqueio explícito de UPDATE e DELETE em admin_audit_log (defesa em profundidade)
DROP POLICY IF EXISTS admin_audit_log_no_update ON public.admin_audit_log;
DROP POLICY IF EXISTS admin_audit_log_no_delete ON public.admin_audit_log;

CREATE POLICY admin_audit_log_no_update
  ON public.admin_audit_log
  FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY admin_audit_log_no_delete
  ON public.admin_audit_log
  FOR DELETE
  TO authenticated, anon
  USING (false);

-- RPC para listar audit log com filtros e paginação (somente leitura)
CREATE OR REPLACE FUNCTION public.admin_list_audit_log(
  p_action     text DEFAULT NULL,
  p_target_type text DEFAULT NULL,
  p_target_id  text DEFAULT NULL,
  p_search     text DEFAULT NULL,
  p_date_from  timestamptz DEFAULT NULL,
  p_date_to    timestamptz DEFAULT NULL,
  p_limit      int DEFAULT 50,
  p_offset     int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  admin_id uuid,
  admin_name text,
  action text,
  target_type text,
  target_id text,
  target_name text,
  metadata jsonb,
  ip_address text,
  user_agent text,
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
      al.id, al.created_at, al.admin_id,
      COALESCE((SELECT s.name FROM public.schools s WHERE s.id = al.admin_id), al.admin_id::text) AS admin_name,
      al.action, al.target_type, al.target_id,
      CASE
        WHEN al.target_type = 'school' THEN
          (SELECT s.name FROM public.schools s WHERE s.id::text = al.target_id)
        WHEN al.target_type = 'practitioner' THEN
          (SELECT (p.first_name || ' ' || p.last_name) FROM public.practitioners p WHERE p.id::text = al.target_id)
        ELSE NULL
      END AS target_name,
      al.metadata, al.ip_address, al.user_agent
    FROM public.admin_audit_log al
  ),
  filtered AS (
    SELECT * FROM base b
    WHERE
      (p_action IS NULL OR p_action = '' OR b.action = p_action)
      AND (p_target_type IS NULL OR p_target_type = '' OR b.target_type = p_target_type)
      AND (p_target_id IS NULL OR p_target_id = '' OR b.target_id = p_target_id)
      AND (p_search IS NULL OR p_search = ''
           OR b.target_id ILIKE '%' || p_search || '%'
           OR COALESCE(b.target_name, '') ILIKE '%' || p_search || '%'
           OR COALESCE(b.admin_name, '') ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR b.created_at >= p_date_from)
      AND (p_date_to   IS NULL OR b.created_at <= p_date_to)
  ),
  counted AS (SELECT COUNT(*) AS total FROM filtered)
  SELECT
    f.id, f.created_at, f.admin_id, f.admin_name, f.action,
    f.target_type, f.target_id, f.target_name, f.metadata,
    f.ip_address, f.user_agent,
    (SELECT total FROM counted) AS total_count
  FROM filtered f
  ORDER BY f.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- RPC para listar valores distintos de action (para o filtro dropdown)
CREATE OR REPLACE FUNCTION public.admin_audit_log_actions()
RETURNS TABLE (action text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT DISTINCT al.action
  FROM public.admin_audit_log al
  WHERE al.action IS NOT NULL
  ORDER BY al.action ASC;
END;
$$;