CREATE OR REPLACE FUNCTION public.school_stale_tickets_count()
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v int;
BEGIN
  SELECT COUNT(*) INTO v
  FROM public.support_tickets t
  WHERE t.school_id = auth.uid()
    AND t.status = 'awaiting_school'
    AND t.last_message_at <= NOW() - INTERVAL '24 hours';
  RETURN COALESCE(v, 0);
END;
$$;