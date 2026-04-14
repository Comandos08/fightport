CREATE TRIGGER debit_credit_on_achievement
  AFTER INSERT ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.debit_credit_on_achievement();

CREATE TRIGGER update_current_belt
  AFTER INSERT ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_current_belt();