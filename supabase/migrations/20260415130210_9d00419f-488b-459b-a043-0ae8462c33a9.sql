-- Remove duplicate triggers, keep the properly named ones
DROP TRIGGER IF EXISTS trigger_debit_credit ON public.achievements;
DROP TRIGGER IF EXISTS trigger_update_belt ON public.achievements;