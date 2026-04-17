-- Migration 4 de 4 — Restringir head_coaches e expor view pública mínima
-- Objetivo: parar de expor a tabela head_coaches inteira para anon/authenticated
-- e disponibilizar apenas os campos necessários (name, graduation, school_id)
-- via uma view pública dedicada usada pelo passaporte público.

-- 1) View pública mínima (apenas campos exibidos no passaporte)
CREATE OR REPLACE VIEW public.head_coaches_public
WITH (security_invoker = true)
AS
SELECT
  id,
  school_id,
  name,
  graduation
FROM public.head_coaches;

-- Garantir leitura pública da view
GRANT SELECT ON public.head_coaches_public TO anon, authenticated;

-- 2) Remover policies antigas amplas da tabela base head_coaches
DROP POLICY IF EXISTS "Head coaches are viewable by everyone" ON public.head_coaches;
DROP POLICY IF EXISTS "Public can view head coaches" ON public.head_coaches;
DROP POLICY IF EXISTS "Anyone can view head coaches" ON public.head_coaches;
DROP POLICY IF EXISTS "head_coaches_public_read" ON public.head_coaches;
DROP POLICY IF EXISTS "Head coaches viewable by school owner" ON public.head_coaches;
DROP POLICY IF EXISTS "head_coaches_owner_select" ON public.head_coaches;

-- 3) Garantir RLS habilitado
ALTER TABLE public.head_coaches ENABLE ROW LEVEL SECURITY;

-- 4) Nova policy: apenas a escola dona pode ler suas próprias linhas direto da tabela
CREATE POLICY "head_coaches_owner_select"
  ON public.head_coaches
  FOR SELECT
  TO authenticated
  USING (school_id = auth.uid());

-- Observação: as policies de INSERT/UPDATE/DELETE já existentes para a escola dona
-- (gerenciamento do head coach via /painel/configuracoes) NÃO são tocadas.
-- O acesso público ao nome do head coach passa exclusivamente pela view
-- public.head_coaches_public (consumida pelo Passport.tsx).