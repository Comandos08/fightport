CREATE TABLE public.school_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  entity_name text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_school_audit_log_school_id ON public.school_audit_log(school_id);
CREATE INDEX idx_school_audit_log_created_at ON public.school_audit_log(created_at DESC);

ALTER TABLE public.school_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_school_audit"
ON public.school_audit_log FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "school_insert_own_audit"
ON public.school_audit_log FOR INSERT
TO authenticated
WITH CHECK (school_id = auth.uid());