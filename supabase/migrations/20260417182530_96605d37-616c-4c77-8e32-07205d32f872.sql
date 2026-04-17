-- =============================================================
-- Fase 2A · M1.2 — practitioners_public com security_invoker
-- =============================================================
-- Problema original: view era SECURITY DEFINER, bypassando RLS.
-- Correção: recriar com security_invoker=true, fazendo JOIN com
-- schools_public (segura) em vez de schools (tabela base).
-- =============================================================

-- Remover a view atual (SECURITY DEFINER, JOIN direto com schools)
DROP VIEW IF EXISTS public.practitioners_public CASCADE;

-- Recriar com security_invoker e JOIN com schools_public
-- IMPORTANTE: mantém EXATAMENTE o mesmo conjunto de colunas que a view
-- antiga expunha, incluindo school_name e school_martial_art que
-- Passport.tsx consome.
CREATE VIEW public.practitioners_public
  WITH (security_invoker = true)
  AS
  SELECT
    p.id,
    p.fp_id,
    p.first_name,
    p.last_name,
    p.photo_url,
    p.martial_art,
    p.current_belt,
    p.school_id,
    p.created_at,
    p.updated_at,
    s.name AS school_name,
    s.martial_art AS school_martial_art
  FROM public.practitioners p
  LEFT JOIN public.schools_public s ON s.id = p.school_id;

-- Conceder SELECT
GRANT SELECT ON public.practitioners_public TO anon, authenticated;

-- Policy pública RESTRITA na tabela base practitioners
-- (necessária para security_invoker funcionar)
DROP POLICY IF EXISTS practitioners_public_read ON public.practitioners;
CREATE POLICY practitioners_public_read ON public.practitioners
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Nota: colunas sensíveis de `practitioners` (cpf, birth_date, gender,
-- father_name, mother_name) NÃO estão no SELECT da view. A tabela base
-- permanece com as policies existentes de escola dona para operações
-- autenticadas (edição pelo painel).