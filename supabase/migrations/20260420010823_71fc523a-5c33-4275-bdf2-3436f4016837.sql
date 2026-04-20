DROP POLICY IF EXISTS "notifications_insert_authenticated" ON public.notifications;

CREATE POLICY "notifications_insert_valid_types"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
  type IN (
    'ticket_reply',
    'courtesy_credits',
    'account_suspended',
    'account_reactivated',
    'new_ticket',
    'new_school',
    'payment_approved'
  )
);