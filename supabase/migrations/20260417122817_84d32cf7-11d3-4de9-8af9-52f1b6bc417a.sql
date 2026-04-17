-- =========================================
-- TABELAS
-- =========================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'outro',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  CONSTRAINT support_tickets_category_chk
    CHECK (category IN ('bug','duvida','creditos','cadastro','outro')),
  CONSTRAINT support_tickets_status_chk
    CHECK (status IN ('open','awaiting_admin','awaiting_school','resolved','closed')),
  CONSTRAINT support_tickets_priority_chk
    CHECK (priority IN ('low','normal','high','urgent'))
);

CREATE INDEX IF NOT EXISTS support_tickets_school_idx ON public.support_tickets(school_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_last_msg_idx ON public.support_tickets(last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_type text NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  read_by_recipient boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_messages_author_type_chk
    CHECK (author_type IN ('school','admin')),
  CONSTRAINT support_messages_content_chk
    CHECK (length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS support_messages_ticket_idx ON public.support_messages(ticket_id, created_at);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS — support_tickets
-- =========================================
DROP POLICY IF EXISTS support_tickets_select_own_or_admin ON public.support_tickets;
CREATE POLICY support_tickets_select_own_or_admin
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (school_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS support_tickets_insert_school ON public.support_tickets;
CREATE POLICY support_tickets_insert_school
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (school_id = auth.uid());

DROP POLICY IF EXISTS support_tickets_update_admin_or_owner ON public.support_tickets;
CREATE POLICY support_tickets_update_admin_or_owner
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (school_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (school_id = auth.uid() OR public.is_admin(auth.uid()));

-- Sem DELETE policy → ninguém pode deletar tickets.

-- =========================================
-- RLS — support_messages
-- =========================================
DROP POLICY IF EXISTS support_messages_select_own_or_admin ON public.support_messages;
CREATE POLICY support_messages_select_own_or_admin
  ON public.support_messages FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_messages.ticket_id AND t.school_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS support_messages_insert_school ON public.support_messages;
CREATE POLICY support_messages_insert_school
  ON public.support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    author_type = 'school'
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_messages.ticket_id AND t.school_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS support_messages_insert_admin ON public.support_messages;
CREATE POLICY support_messages_insert_admin
  ON public.support_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    author_type = 'admin'
    AND author_id = auth.uid()
    AND public.is_admin(auth.uid())
  );

-- Apenas update do flag read_by_recipient é necessário; permitido somente via RPC SECURITY DEFINER.
DROP POLICY IF EXISTS support_messages_update_read ON public.support_messages;
CREATE POLICY support_messages_update_read
  ON public.support_messages FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Sem DELETE policy → mensagens são imutáveis (nem owner nem admin podem apagar).

-- =========================================
-- TRIGGER: ajustar last_message_at e status
-- =========================================
CREATE OR REPLACE FUNCTION public.support_message_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.support_tickets
     SET last_message_at = NEW.created_at,
         updated_at      = NEW.created_at,
         status = CASE
           WHEN status IN ('resolved','closed') THEN status
           WHEN NEW.author_type = 'school' THEN 'awaiting_admin'
           WHEN NEW.author_type = 'admin'  THEN 'awaiting_school'
           ELSE status
         END
   WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_message_after_insert_trg ON public.support_messages;
CREATE TRIGGER support_message_after_insert_trg
AFTER INSERT ON public.support_messages
FOR EACH ROW EXECUTE FUNCTION public.support_message_after_insert();

-- =========================================
-- RPCs
-- =========================================
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_ticket_id uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id uuid;
  v_is_admin boolean := public.is_admin(auth.uid());
BEGIN
  IF p_role NOT IN ('school','admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  SELECT school_id INTO v_school_id FROM public.support_tickets WHERE id = p_ticket_id;
  IF v_school_id IS NULL THEN RAISE EXCEPTION 'Ticket not found'; END IF;

  IF p_role = 'school' THEN
    -- Marca como lidas as mensagens enviadas pelo admin (recebidas pela escola)
    IF v_school_id <> auth.uid() THEN RAISE EXCEPTION 'Not authorized'; END IF;
    UPDATE public.support_messages
       SET read_by_recipient = true
     WHERE ticket_id = p_ticket_id AND author_type = 'admin' AND read_by_recipient = false;
  ELSE
    -- Admin lê mensagens enviadas pela escola
    IF NOT v_is_admin THEN RAISE EXCEPTION 'Not authorized'; END IF;
    UPDATE public.support_messages
       SET read_by_recipient = true
     WHERE ticket_id = p_ticket_id AND author_type = 'school' AND read_by_recipient = false;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.school_unread_messages_count()
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v int;
BEGIN
  SELECT COUNT(*) INTO v
  FROM public.support_messages m
  JOIN public.support_tickets t ON t.id = m.ticket_id
  WHERE t.school_id = auth.uid()
    AND m.author_type = 'admin'
    AND m.read_by_recipient = false;
  RETURN COALESCE(v, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_awaiting_admin_count()
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v int;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT COUNT(*) INTO v FROM public.support_tickets
   WHERE status IN ('open','awaiting_admin');
  RETURN COALESCE(v, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_support_tickets(p_status text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  school_id uuid,
  school_name text,
  subject text,
  category text,
  status text,
  priority text,
  last_message_at timestamptz,
  created_at timestamptz,
  preview text,
  unread_for_admin int
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;

  RETURN QUERY
  SELECT
    t.id, t.school_id, s.name AS school_name,
    t.subject, t.category, t.status, t.priority,
    t.last_message_at, t.created_at,
    (SELECT LEFT(m.content, 120) FROM public.support_messages m
       WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) AS preview,
    (SELECT COUNT(*)::int FROM public.support_messages m
       WHERE m.ticket_id = t.id AND m.author_type = 'school' AND m.read_by_recipient = false) AS unread_for_admin
  FROM public.support_tickets t
  LEFT JOIN public.schools s ON s.id = t.school_id
  WHERE
    p_status IS NULL OR p_status = '' OR p_status = 'all'
    OR (p_status = 'open'      AND t.status IN ('open','awaiting_admin'))
    OR (p_status = 'awaiting_school' AND t.status = 'awaiting_school')
    OR (p_status = 'resolved'  AND t.status IN ('resolved','closed'))
  ORDER BY t.last_message_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_resolve_ticket(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.support_tickets
     SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
   WHERE id = p_ticket_id;
END;
$$;