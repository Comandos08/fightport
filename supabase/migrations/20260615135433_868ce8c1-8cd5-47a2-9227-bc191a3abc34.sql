CREATE TABLE public.mp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text,
  signature_valid boolean NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  error text,
  headers jsonb,
  body jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.mp_webhook_events TO authenticated;
GRANT ALL ON public.mp_webhook_events TO service_role;
ALTER TABLE public.mp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads webhook log" ON public.mp_webhook_events
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX mp_webhook_events_created_at_idx ON public.mp_webhook_events (created_at DESC);
CREATE INDEX mp_webhook_events_payment_id_idx ON public.mp_webhook_events (payment_id);