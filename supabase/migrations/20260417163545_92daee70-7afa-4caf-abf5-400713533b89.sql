-- Remove policy ampla que permitia à escola dar UPDATE no próprio saldo
DROP POLICY IF EXISTS credits_own ON public.credits;

-- Cria apenas SELECT para a escola logada
DROP POLICY IF EXISTS credits_select_own ON public.credits;
CREATE POLICY credits_select_own ON public.credits
  FOR SELECT
  TO authenticated
  USING (school_id = auth.uid());

-- Admin continua vendo tudo via função is_admin
DROP POLICY IF EXISTS credits_select_admin ON public.credits;
CREATE POLICY credits_select_admin ON public.credits
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Garantir que RLS está ativo
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;