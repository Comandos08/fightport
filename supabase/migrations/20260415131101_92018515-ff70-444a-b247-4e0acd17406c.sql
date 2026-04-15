CREATE OR REPLACE FUNCTION public.add_credits(p_school_id uuid, p_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.credits
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE school_id = p_school_id;

  IF NOT FOUND THEN
    INSERT INTO public.credits (school_id, balance, updated_at)
    VALUES (p_school_id, p_amount, NOW());
  END IF;
END;
$$;