import { supabase } from '@/integrations/supabase/client';

export type NotificationType =
  | 'ticket_reply'
  | 'courtesy_credits'
  | 'account_suspended'
  | 'account_reactivated'
  | 'new_ticket'
  | 'new_school'
  | 'payment_approved';

export interface NotificationPayload {
  recipient_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}

/**
 * Fire-and-forget: insere uma notificação. Nunca lança — falhas são apenas logadas.
 * Use para eventos não-críticos onde a ação principal já foi concluída.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      recipient_id: payload.recipient_id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link ?? null,
    });
    if (error) {
      console.warn('[notifications] insert failed:', error.message);
    }
  } catch (e) {
    console.warn('[notifications] insert exception:', e);
  }
}

/** Busca o ID do destinatário admin (cacheado por sessão). */
let _adminIdCache: string | null = null;
export async function getAdminRecipientId(): Promise<string | null> {
  if (_adminIdCache) return _adminIdCache;
  try {
    const { data, error } = await supabase.rpc('get_admin_recipient_id');
    if (error || !data) return null;
    _adminIdCache = data as string;
    return _adminIdCache;
  } catch {
    return null;
  }
}

/** Helper: notifica o admin (busca o ID automaticamente). */
export async function notifyAdmin(args: {
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}): Promise<void> {
  const adminId = await getAdminRecipientId();
  if (!adminId) {
    console.warn('[notifications] admin recipient id not found');
    return;
  }
  await sendNotification({ recipient_id: adminId, ...args });
}
