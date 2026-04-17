-- =============================================================
-- Fase 2A · M2 — Converter head_coaches_public para security_invoker
-- =============================================================
DROP VIEW IF EXISTS public.head_coaches_public CASCADE;

CREATE VIEW public.head_coaches_public
  WITH (security_invoker = true)
  AS
  SELECT
    id,
    school_id,
    name,
    graduation,
    created_at
  FROM public.head_coaches;

GRANT SELECT ON public.head_coaches_public TO anon, authenticated;

DROP POLICY IF EXISTS head_coaches_public_read ON public.head_coaches;
CREATE POLICY head_coaches_public_read ON public.head_coaches
  FOR SELECT
  TO anon, authenticated
  USING (true);