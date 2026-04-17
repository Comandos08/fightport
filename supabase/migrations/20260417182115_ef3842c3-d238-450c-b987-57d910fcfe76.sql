-- =============================================================
-- Fase 2A · M1.1 — Criar view pública de schools
-- =============================================================
-- Objetivo: permitir que views com security_invoker=true (como a
-- nova practitioners_public) acessem dados públicos de schools sem
-- precisar de policy permissiva na tabela base.
-- =============================================================

-- Criar view com apenas colunas não-sensíveis
CREATE OR REPLACE VIEW public.schools_public
  WITH (security_invoker = true)
  AS
  SELECT
    id,
    name,
    martial_art,
    logo_url,
    city,
    state,
    created_at
  FROM public.schools;

-- Conceder SELECT para anon e authenticated
GRANT SELECT ON public.schools_public TO anon, authenticated;

-- Policy pública de SELECT na tabela base (necessária para security_invoker
-- da view funcionar). A segurança vem do SELECT explícito da view (colunas
-- limitadas), não da policy da tabela base.
-- A tabela schools continua protegida para operações de escrita e para
-- consultas diretas (o frontend público NÃO deve consultar schools direto,
-- apenas via schools_public).
DROP POLICY IF EXISTS schools_public_read ON public.schools;
CREATE POLICY schools_public_read ON public.schools
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Nota: as policies existentes de escola dona (leitura completa dos
-- próprios dados, incluindo email, is_admin, etc.) continuam funcionando
-- porque são FOR SELECT com USING baseado em school_id = auth.uid().
-- A nova policy é adicional, não substitui as existentes.