-- Migration 2 de 4 — Fechar INSERT/UPDATE em credit_transactions
-- Remove policy FOR ALL que permitia a escola inserir transações arbitrárias
DROP POLICY IF EXISTS transactions_own ON public.credit_transactions;

-- Cria apenas SELECT para a escola logada
CREATE POLICY transactions_select_own ON public.credit_transactions
  FOR SELECT
  TO authenticated
  USING (school_id = auth.uid());

-- Admin continua lendo tudo
CREATE POLICY transactions_select_admin ON public.credit_transactions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Mutações ficam sem policy para authenticated.
-- Webhook do Mercado Pago (que insere type='purchase') roda com service_role.
-- Trigger debit_credit_on_achievement (que insere type='usage') é SECURITY DEFINER.
-- Concessão de crédito bônus do admin é via função SECURITY DEFINER.

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;