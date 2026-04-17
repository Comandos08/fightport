-- 1. Adicionar colunas de admin/suspensão em schools
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- 2. Função SECURITY DEFINER para verificar admin sem recursão de RLS
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.schools WHERE id = _user_id),
    FALSE
  );
$$;

-- 3. Tabela de auditoria imutável
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON public.admin_audit_log(target_type, target_id);

-- 4. RLS — apenas admins leem/inserem; ninguém atualiza ou deleta
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_log_select_admin"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_audit_log_insert_admin"
  ON public.admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()) AND admin_id = auth.uid());

-- Sem políticas de UPDATE/DELETE → imutável
