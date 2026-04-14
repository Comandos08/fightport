
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'practitioners_school_update' AND tablename = 'practitioners') THEN
    CREATE POLICY "practitioners_school_update" ON public.practitioners
    FOR UPDATE USING (school_id = auth.uid())
    WITH CHECK (school_id = auth.uid());
  END IF;
END $$;
