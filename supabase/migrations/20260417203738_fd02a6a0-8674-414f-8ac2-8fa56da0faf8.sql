-- Fase 2A · M4 — Blindar achievements contra INSERT cross-school
DROP POLICY IF EXISTS achievements_school_write ON public.achievements;

CREATE POLICY achievements_school_write ON public.achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.practitioners p
      WHERE p.id = practitioner_id
        AND p.school_id = auth.uid()
    )
  );

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;