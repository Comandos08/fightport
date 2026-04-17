-- =========================================================
-- LISTA DE ORGANIZAÇÕES (com filtros, busca, ordenação, paginação)
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_list_schools(
  p_search       TEXT       DEFAULT NULL,
  p_martial_art  TEXT       DEFAULT NULL,
  p_state        TEXT       DEFAULT NULL,
  p_status       TEXT       DEFAULT NULL,    -- 'active' | 'suspended' | NULL
  p_credits      TEXT       DEFAULT NULL,    -- 'with' | 'without' | NULL
  p_date_from    TIMESTAMPTZ DEFAULT NULL,
  p_date_to      TIMESTAMPTZ DEFAULT NULL,
  p_sort         TEXT       DEFAULT 'created_at',
  p_dir          TEXT       DEFAULT 'desc',
  p_limit        INT        DEFAULT 50,
  p_offset       INT        DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  head_coach TEXT,
  email TEXT,
  city TEXT,
  state TEXT,
  martial_art TEXT,
  created_at TIMESTAMPTZ,
  balance INT,
  total_spent NUMERIC,
  is_suspended BOOLEAN,
  is_admin BOOLEAN,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT
      s.id,
      s.name,
      (SELECT hc.name FROM public.head_coaches hc WHERE hc.school_id = s.id ORDER BY hc.created_at ASC LIMIT 1) AS head_coach,
      s.email,
      s.city,
      s.state,
      s.martial_art,
      s.created_at,
      COALESCE((SELECT c.balance FROM public.credits c WHERE c.school_id = s.id), 0)::INT AS balance,
      COALESCE((
        SELECT SUM(ct.price_brl) FROM public.credit_transactions ct
        WHERE ct.school_id = s.id AND ct.type = 'purchase' AND ct.status = 'completed'
      ), 0)::NUMERIC AS total_spent,
      s.is_suspended,
      s.is_admin
    FROM public.schools s
  ),
  filtered AS (
    SELECT * FROM base b
    WHERE
      (p_search IS NULL OR p_search = '' OR
        b.name ILIKE '%' || p_search || '%' OR
        b.email ILIKE '%' || p_search || '%' OR
        COALESCE(b.city, '') ILIKE '%' || p_search || '%')
      AND (p_martial_art IS NULL OR p_martial_art = '' OR b.martial_art = p_martial_art)
      AND (p_state IS NULL OR p_state = '' OR b.state = p_state)
      AND (p_status IS NULL OR p_status = ''
           OR (p_status = 'suspended' AND b.is_suspended = TRUE)
           OR (p_status = 'active'    AND b.is_suspended = FALSE))
      AND (p_credits IS NULL OR p_credits = ''
           OR (p_credits = 'with'    AND b.balance > 0)
           OR (p_credits = 'without' AND b.balance = 0))
      AND (p_date_from IS NULL OR b.created_at >= p_date_from)
      AND (p_date_to   IS NULL OR b.created_at <= p_date_to)
  ),
  counted AS (SELECT COUNT(*) AS total FROM filtered)
  SELECT
    f.id, f.name, f.head_coach, f.email, f.city, f.state, f.martial_art,
    f.created_at, f.balance, f.total_spent, f.is_suspended, f.is_admin,
    (SELECT total FROM counted) AS total_count
  FROM filtered f
  ORDER BY
    CASE WHEN p_sort = 'name'        AND p_dir = 'asc'  THEN f.name        END ASC,
    CASE WHEN p_sort = 'name'        AND p_dir = 'desc' THEN f.name        END DESC,
    CASE WHEN p_sort = 'email'       AND p_dir = 'asc'  THEN f.email       END ASC,
    CASE WHEN p_sort = 'email'       AND p_dir = 'desc' THEN f.email       END DESC,
    CASE WHEN p_sort = 'city'        AND p_dir = 'asc'  THEN f.city        END ASC,
    CASE WHEN p_sort = 'city'        AND p_dir = 'desc' THEN f.city        END DESC,
    CASE WHEN p_sort = 'martial_art' AND p_dir = 'asc'  THEN f.martial_art END ASC,
    CASE WHEN p_sort = 'martial_art' AND p_dir = 'desc' THEN f.martial_art END DESC,
    CASE WHEN p_sort = 'balance'     AND p_dir = 'asc'  THEN f.balance     END ASC,
    CASE WHEN p_sort = 'balance'     AND p_dir = 'desc' THEN f.balance     END DESC,
    CASE WHEN p_sort = 'total_spent' AND p_dir = 'asc'  THEN f.total_spent END ASC,
    CASE WHEN p_sort = 'total_spent' AND p_dir = 'desc' THEN f.total_spent END DESC,
    CASE WHEN p_sort = 'created_at'  AND p_dir = 'asc'  THEN f.created_at  END ASC,
    CASE WHEN p_sort = 'created_at'  AND p_dir = 'desc' THEN f.created_at  END DESC,
    f.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- =========================================================
-- DETALHE — escola
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_get_school(p_school_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v JSONB;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT jsonb_build_object(
    'school', to_jsonb(s.*),
    'head_coach', (SELECT to_jsonb(hc.*) FROM public.head_coaches hc WHERE hc.school_id = s.id ORDER BY hc.created_at ASC LIMIT 1),
    'balance', COALESCE((SELECT c.balance FROM public.credits c WHERE c.school_id = s.id), 0),
    'total_purchased_credits', COALESCE((SELECT SUM(ct.amount) FROM public.credit_transactions ct WHERE ct.school_id = s.id AND ct.type IN ('purchase','bonus') AND ct.status = 'completed'), 0),
    'total_used_credits',      COALESCE((SELECT -SUM(ct.amount) FROM public.credit_transactions ct WHERE ct.school_id = s.id AND ct.type = 'usage' AND ct.status = 'completed'), 0),
    'total_spent_brl',         COALESCE((SELECT SUM(ct.price_brl) FROM public.credit_transactions ct WHERE ct.school_id = s.id AND ct.type = 'purchase' AND ct.status = 'completed'), 0),
    'practitioners_count',     (SELECT COUNT(*) FROM public.practitioners p WHERE p.school_id = s.id),
    'achievements_count',      (SELECT COUNT(*) FROM public.achievements a WHERE a.school_id = s.id)
  ) INTO v
  FROM public.schools s WHERE s.id = p_school_id;

  RETURN v;
END;
$$;

-- =========================================================
-- DETALHE — listas
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_school_practitioners(p_school_id UUID)
RETURNS TABLE(id UUID, fp_id TEXT, first_name TEXT, last_name TEXT, current_belt TEXT, martial_art TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT p.id, p.fp_id, p.first_name, p.last_name, p.current_belt, p.martial_art, p.created_at
  FROM public.practitioners p WHERE p.school_id = p_school_id ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_school_achievements(p_school_id UUID)
RETURNS TABLE(id UUID, practitioner_name TEXT, fp_id TEXT, belt TEXT, degree INT, graduation_date DATE, graduated_by TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT a.id, (p.first_name || ' ' || p.last_name) AS practitioner_name, p.fp_id,
         a.belt, a.degree, a.graduation_date, a.graduated_by, a.created_at
  FROM public.achievements a JOIN public.practitioners p ON p.id = a.practitioner_id
  WHERE a.school_id = p_school_id ORDER BY a.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_school_transactions(p_school_id UUID)
RETURNS TABLE(id UUID, type TEXT, amount INT, price_brl NUMERIC, package_name TEXT, status TEXT, payment_id TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT ct.id, ct.type, ct.amount, ct.price_brl, ct.package_name, ct.status, ct.payment_id, ct.created_at
  FROM public.credit_transactions ct WHERE ct.school_id = p_school_id ORDER BY ct.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_school_tickets(p_school_id UUID)
RETURNS TABLE(id UUID, name TEXT, email TEXT, subject TEXT, message TEXT, status TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT s.email INTO v_email FROM public.schools s WHERE s.id = p_school_id;
  RETURN QUERY
  SELECT cs.id, cs.name, cs.email, cs.subject, cs.message, cs.status, cs.created_at
  FROM public.contact_submissions cs
  WHERE cs.email = v_email AND cs.status = 'pending'
  ORDER BY cs.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_school_audit(p_school_id UUID)
RETURNS TABLE(id UUID, admin_id UUID, admin_name TEXT, action TEXT, metadata JSONB, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  SELECT al.id, al.admin_id,
         COALESCE((SELECT s.name FROM public.schools s WHERE s.id = al.admin_id), al.admin_id::TEXT) AS admin_name,
         al.action, al.metadata, al.created_at
  FROM public.admin_audit_log al
  WHERE al.target_type = 'school' AND al.target_id = p_school_id::TEXT
  ORDER BY al.created_at DESC;
END;
$$;

-- =========================================================
-- AÇÕES — suspender / reativar
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_suspend_school(p_school_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  UPDATE public.schools
     SET is_suspended = TRUE,
         suspended_at = NOW(),
         suspended_reason = p_reason,
         updated_at = NOW()
   WHERE id = p_school_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'school.suspend', 'school', p_school_id::TEXT,
          jsonb_build_object('reason', p_reason));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reactivate_school(p_school_id UUID, p_reason TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  UPDATE public.schools
     SET is_suspended = FALSE,
         suspended_at = NULL,
         suspended_reason = NULL,
         updated_at = NOW()
   WHERE id = p_school_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'school.reactivate', 'school', p_school_id::TEXT,
          jsonb_build_object('reason', p_reason));
END;
$$;

-- =========================================================
-- AÇÃO — conceder créditos de cortesia (atômico, NUNCA deleta histórico)
-- =========================================================
CREATE OR REPLACE FUNCTION public.admin_grant_bonus_credits(
  p_school_id UUID,
  p_amount    INT,
  p_reason    TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.schools WHERE id = p_school_id) THEN
    RAISE EXCEPTION 'School not found';
  END IF;

  -- Função inteira roda em uma única transação implícita.
  INSERT INTO public.credit_transactions (school_id, type, amount, status, package_name)
  VALUES (p_school_id, 'bonus', p_amount, 'completed', 'Cortesia administrativa');

  -- Soma ao saldo (cria registro se ainda não existir)
  PERFORM public.add_credits(p_school_id, p_amount);

  INSERT INTO public.admin_audit_log (admin_id, action, target_type, target_id, metadata)
  VALUES (auth.uid(), 'school.grant_bonus', 'school', p_school_id::TEXT,
          jsonb_build_object('amount', p_amount, 'reason', p_reason));
END;
$$;
