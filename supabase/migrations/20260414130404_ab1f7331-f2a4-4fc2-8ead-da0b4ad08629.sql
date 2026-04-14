CREATE POLICY "practitioners_school_delete"
ON public.practitioners
FOR DELETE
USING (school_id = auth.uid());