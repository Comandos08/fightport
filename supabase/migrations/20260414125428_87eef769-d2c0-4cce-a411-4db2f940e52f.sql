
-- Drop the foreign key constraint that causes issues with the trigger
ALTER TABLE public.credit_transactions DROP CONSTRAINT IF EXISTS credit_transactions_achievement_id_fkey;

-- Recreate the trigger functions to ensure they exist
CREATE OR REPLACE FUNCTION public.debit_credit_on_achievement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT balance FROM public.credits WHERE school_id = NEW.school_id) < 1 THEN
    RAISE EXCEPTION 'Saldo de créditos insuficiente';
  END IF;

  UPDATE public.credits
  SET balance = balance - 1,
      updated_at = NOW()
  WHERE school_id = NEW.school_id;

  INSERT INTO public.credit_transactions (school_id, type, amount, achievement_id, status)
  VALUES (NEW.school_id, 'usage', -1, NEW.id, 'completed');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_current_belt()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.practitioners
  SET current_belt = NEW.belt,
      updated_at = NOW()
  WHERE id = NEW.practitioner_id;
  RETURN NEW;
END;
$$;

-- Recreate triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS debit_credit_on_achievement ON public.achievements;
DROP TRIGGER IF EXISTS update_current_belt ON public.achievements;

CREATE TRIGGER debit_credit_on_achievement
  BEFORE INSERT ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.debit_credit_on_achievement();

CREATE TRIGGER update_current_belt
  AFTER INSERT ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_current_belt();
