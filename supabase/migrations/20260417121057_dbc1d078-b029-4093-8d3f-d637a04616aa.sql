-- Métricas globais com variação MoM
CREATE OR REPLACE FUNCTION public.admin_get_overview()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_month_start TIMESTAMPTZ := date_trunc('month', v_now);
  v_prev_month_start TIMESTAMPTZ := date_trunc('month', v_now - INTERVAL '1 month');
  v_schools_total INT;
  v_schools_prev INT;
  v_practitioners_total INT;
  v_practitioners_prev INT;
  v_achievements_month INT;
  v_revenue_month NUMERIC;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO v_schools_total FROM public.schools WHERE created_at < v_month_start + INTERVAL '1 month';
  SELECT COUNT(*) INTO v_schools_prev FROM public.schools WHERE created_at < v_month_start;

  SELECT COUNT(*) INTO v_practitioners_total FROM public.practitioners WHERE created_at < v_month_start + INTERVAL '1 month';
  SELECT COUNT(*) INTO v_practitioners_prev FROM public.practitioners WHERE created_at < v_month_start;

  SELECT COUNT(*) INTO v_achievements_month FROM public.achievements WHERE created_at >= v_month_start;

  SELECT COALESCE(SUM(price_brl), 0) INTO v_revenue_month
  FROM public.credit_transactions
  WHERE type = 'purchase' AND status = 'completed' AND created_at >= v_month_start;

  RETURN jsonb_build_object(
    'schools_total', v_schools_total,
    'schools_prev', v_schools_prev,
    'practitioners_total', v_practitioners_total,
    'practitioners_prev', v_practitioners_prev,
    'achievements_month', v_achievements_month,
    'revenue_month', v_revenue_month
  );
END;
$$;

-- Crescimento mensal de escolas e atletas (12 meses)
CREATE OR REPLACE FUNCTION public.admin_growth_monthly()
RETURNS TABLE(month TEXT, schools_count BIGINT, practitioners_count BIGINT)
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
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', NOW() - INTERVAL '11 months'),
      date_trunc('month', NOW()),
      INTERVAL '1 month'
    ) AS m
  )
  SELECT
    to_char(m, 'YYYY-MM') AS month,
    (SELECT COUNT(*) FROM public.schools s WHERE s.created_at < m + INTERVAL '1 month') AS schools_count,
    (SELECT COUNT(*) FROM public.practitioners p WHERE p.created_at < m + INTERVAL '1 month') AS practitioners_count
  FROM months
  ORDER BY m;
END;
$$;

-- Receita mensal (12 meses)
CREATE OR REPLACE FUNCTION public.admin_revenue_monthly()
RETURNS TABLE(month TEXT, revenue NUMERIC)
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
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', NOW() - INTERVAL '11 months'),
      date_trunc('month', NOW()),
      INTERVAL '1 month'
    ) AS m
  )
  SELECT
    to_char(m, 'YYYY-MM') AS month,
    COALESCE((
      SELECT SUM(price_brl) FROM public.credit_transactions ct
      WHERE ct.type = 'purchase' AND ct.status = 'completed'
        AND ct.created_at >= m AND ct.created_at < m + INTERVAL '1 month'
    ), 0) AS revenue
  FROM months
  ORDER BY m;
END;
$$;

-- Graduações por modalidade em um período
CREATE OR REPLACE FUNCTION public.admin_achievements_by_art(p_start TIMESTAMPTZ, p_end TIMESTAMPTZ)
RETURNS TABLE(martial_art TEXT, total BIGINT)
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
  SELECT COALESCE(s.martial_art, 'Outros') AS martial_art, COUNT(*) AS total
  FROM public.achievements a
  JOIN public.schools s ON s.id = a.school_id
  WHERE a.created_at >= p_start AND a.created_at < p_end
  GROUP BY s.martial_art
  ORDER BY total DESC;
END;
$$;

-- Top 5 escolas com saldo zero
CREATE OR REPLACE FUNCTION public.admin_zero_balance_schools()
RETURNS TABLE(school_id UUID, name TEXT, email TEXT, balance INT, updated_at TIMESTAMPTZ)
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
  SELECT s.id, s.name, s.email, COALESCE(c.balance, 0)::INT, c.updated_at
  FROM public.schools s
  LEFT JOIN public.credits c ON c.school_id = s.id
  WHERE COALESCE(c.balance, 0) = 0
  ORDER BY c.updated_at DESC NULLS LAST
  LIMIT 5;
END;
$$;

-- Escolas cadastradas nos últimos 7 dias
CREATE OR REPLACE FUNCTION public.admin_recent_schools()
RETURNS TABLE(school_id UUID, name TEXT, email TEXT, city TEXT, state TEXT, created_at TIMESTAMPTZ)
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
  SELECT s.id, s.name, s.email, s.city, s.state, s.created_at
  FROM public.schools s
  WHERE s.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY s.created_at DESC;
END;
$$;

-- Tickets abertos (contact_submissions com status pending)
CREATE OR REPLACE FUNCTION public.admin_open_tickets_count()
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.contact_submissions WHERE status = 'pending';
  RETURN v_count;
END;
$$;
