
DROP POLICY IF EXISTS "school_own_data" ON public.schools;

CREATE POLICY "school_own_data"
ON public.schools
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
