CREATE OR REPLACE FUNCTION public.admin_finance_overview(
  p_start timestamptz,
  p_end timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_revenue numeric := 0;
  v_tx_count int := 0;
  v_avg_ticket numeric := 0;
  v_unique_schools int := 0;
  v_breakdown jsonb := '[]'::jsonb;
  v_mrr numeric := 0;
  v_ltv numeric := 0;
  v_repurchase_rate numeric := 0;
  v_total_buyers int := 0;
  v_repeat_buyers int := 0;
  v_avg_purchases numeric := 0;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Métricas do período
  SELECT
    COALESCE(SUM(price_brl), 0),
    COUNT(*),
    COUNT(DISTINCT school_id)
  INTO v_revenue, v_tx_count, v_unique_schools
  FROM public.credit_transactions
  WHERE type = 'purchase' AND status = 'completed'
    AND created_at >= p_start AND created_at < p_end;

  IF v_tx_count > 0 THEN
    v_avg_ticket := v_revenue / v_tx_count;
  END IF;

  -- Breakdown por pacote no período
  SELECT COALESCE(jsonb_agg(b ORDER BY (b->>'revenue')::numeric DESC), '[]'::jsonb)
  INTO v_breakdown
  FROM (
    SELECT jsonb_build_object(
      'package', COALESCE(package_name, 'Outros'),
      'count', COUNT(*),
      'revenue', COALESCE(SUM(price_brl), 0)
    ) AS b
    FROM public.credit_transactions
    WHERE type = 'purchase' AND status = 'completed'
      AND created_at >= p_start AND created_at < p_end
    GROUP BY COALESCE(package_name, 'Outros')
  ) t;

  -- MRR: média dos últimos 3 meses cheios (independente do filtro de período)
  SELECT COALESCE(AVG(monthly), 0) INTO v_mrr
  FROM (
    SELECT date_trunc('month', created_at) AS m, SUM(price_brl) AS monthly
    FROM public.credit_transactions
    WHERE type = 'purchase' AND status = 'completed'
      AND created_at >= date_trunc('month', NOW()) - INTERVAL '3 months'
      AND created_at <  date_trunc('month', NOW())
    GROUP BY 1
  ) m;

  -- Taxa de recompra e LTV (sobre toda a base, não só o período)
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE purchases > 1),
    COALESCE(AVG(purchases), 0)
  INTO v_total_buyers, v_repeat_buyers, v_avg_purchases
  FROM (
    SELECT school_id, COUNT(*) AS purchases
    FROM public.credit_transactions
    WHERE type = 'purchase' AND status = 'completed'
    GROUP BY school_id
  ) s;

  IF v_total_buyers > 0 THEN
    v_repurchase_rate := (v_repeat_buyers::numeric / v_total_buyers::numeric) * 100;
  END IF;

  v_ltv := v_avg_ticket * v_avg_purchases;

  RETURN jsonb_build_object(
    'revenue', v_revenue,
    'tx_count', v_tx_count,
    'avg_ticket', v_avg_ticket,
    'unique_schools', v_unique_schools,
    'breakdown', v_breakdown,
    'mrr', v_mrr,
    'ltv', v_ltv,
    'repurchase_rate', v_repurchase_rate,
    'total_buyers', v_total_buyers,
    'repeat_buyers', v_repeat_buyers,
    'avg_purchases', v_avg_purchases
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_finance_top_schools(
  p_start timestamptz,
  p_end timestamptz,
  p_limit int DEFAULT 10
)
RETURNS TABLE(
  school_id uuid,
  school_name text,
  total_revenue numeric,
  tx_count bigint
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
  SELECT
    ct.school_id,
    s.name AS school_name,
    COALESCE(SUM(ct.price_brl), 0)::numeric AS total_revenue,
    COUNT(*)::bigint AS tx_count
  FROM public.credit_transactions ct
  JOIN public.schools s ON s.id = ct.school_id
  WHERE ct.type = 'purchase' AND ct.status = 'completed'
    AND ct.created_at >= p_start AND ct.created_at < p_end
  GROUP BY ct.school_id, s.name
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$;