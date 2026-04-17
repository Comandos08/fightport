-- =============================================================
-- Fase 2A · M3 — View pública de achievements
-- =============================================================
-- Objetivo: higienizar o acesso público. Em vez de expor a tabela
-- base via `achievements_public_read USING (true)`, criar uma view
-- com colunas explícitas. O frontend público (Passport.tsx) passa
-- a consultar a view.
-- =============================================================

CREATE OR REPLACE VIEW public.achievements_public
  WITH (security_invoker = true)
  AS
  SELECT
    id,
    practitioner_id,
    school_id,
    belt,
    degree,
    graduation_date,
    graduated_by,
    notes,
    hash,
    created_at
  FROM public.achievements;

GRANT SELECT ON public.achievements_public TO anon, authenticated;

-- A policy existente `achievements_public_read USING (true)` na
-- tabela base é mantida — necessária para que a view security_invoker
-- funcione para anon/authenticated. A segurança agora vem do SELECT
-- explícito da view (colunas limitadas, `credits_used` omitido).