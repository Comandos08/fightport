CREATE OR REPLACE FUNCTION public.generate_achievement_hash(p_fp_id text, p_belt text, p_date date, p_school text, p_professor text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN encode(
    extensions.digest(
      p_fp_id || '|' || p_belt || '|' || p_date::TEXT || '|' || p_school || '|' || p_professor || '|' || NOW()::TEXT,
      'sha256'
    ),
    'hex'
  );
END;
$$;