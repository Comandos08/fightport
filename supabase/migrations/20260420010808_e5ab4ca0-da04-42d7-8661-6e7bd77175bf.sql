-- Tabela de notificações
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_created ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_recipient_unread ON public.notifications(recipient_id) WHERE read = false;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Destinatário lê as próprias
CREATE POLICY "notifications_select_own"
ON public.notifications FOR SELECT
TO authenticated
USING (recipient_id = auth.uid());

-- Destinatário marca como lidas (update das próprias)
CREATE POLICY "notifications_update_own"
ON public.notifications FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Permitir INSERT autenticado (qualquer usuário pode disparar notificações de eventos
-- pertinentes: escola abrindo ticket -> admin recebe; admin respondendo -> escola recebe;
-- admin agindo -> escola recebe; etc.). Sem restrição extra para não bloquear fire-and-forget.
CREATE POLICY "notifications_insert_authenticated"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Função helper para obter o ID do admin global (cacheable)
CREATE OR REPLACE FUNCTION public.get_admin_recipient_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.schools WHERE is_admin = true ORDER BY created_at ASC LIMIT 1;
$$;