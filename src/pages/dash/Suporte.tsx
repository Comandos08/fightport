import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { sendNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/sendEmail';
import { TicketList } from '@/components/dash/support/TicketList';
import { TicketThread } from '@/components/dash/support/TicketThread';
import type { SupportMessage, SupportTicket } from '@/components/dash/support/types';

const ipt: React.CSSProperties = {
  height: 32, padding: '0 10px', fontFamily: 'var(--font-sans)', fontSize: 13,
  background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm, 6px)', outline: 'none',
};

export default function DashSuporte() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_support_tickets', { p_status: statusFilter });
      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-ticket-messages', selectedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', selectedId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SupportMessage[];
    },
    enabled: !!selectedId,
  });

  // Marca como lidas pelo admin
  useEffect(() => {
    if (!selectedId) return;
    supabase.rpc('mark_messages_read', { p_ticket_id: selectedId, p_role: 'admin' }).then(() => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-awaiting-count'] });
    });
  }, [selectedId, qc]);

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!user || !selectedId) throw new Error('Sem ticket');
      const content = reply.trim();
      if (!content) throw new Error('Mensagem vazia');
      const { error } = await supabase
        .from('support_messages')
        .insert({ ticket_id: selectedId, author_type: 'admin', author_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      // Notifica a escola dona do ticket (fire-and-forget)
      const ticket = tickets.find(tk => tk.id === selectedId);
      if (ticket) {
        sendNotification({
          recipient_id: ticket.school_id,
          type: 'ticket_reply',
          title: 'Suporte respondeu',
          body: `Sua solicitação "${ticket.subject}" recebeu uma resposta.`,
          link: '/painel/suporte',
        });
      }

      // Busca e-mail da escola para notificar por e-mail também (fire-and-forget)
      (async () => {
        const tk = tickets.find(tk => tk.id === selectedId);
        if (!tk) return;
        const { data: schoolAuth } = await supabase
          .from('schools')
          .select('email')
          .eq('id', tk.school_id)
          .maybeSingle();
        if (!schoolAuth?.email) return;
        sendEmail({
          to: schoolAuth.email,
          subject: `[FightPort] Resposta ao seu ticket: ${tk.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0D0D0D;">
              <h2 style="margin: 0 0 16px; font-size: 20px;">Sua solicitação recebeu uma resposta</h2>
              <p style="font-size: 14px; line-height: 1.5;">
                O assunto <strong>"${tk.subject}"</strong> foi respondido pela equipe FightPort.
              </p>
              <p style="margin: 24px 0;">
                <a href="https://fightport.pro/painel/suporte" style="display: inline-block; background: #0D0D0D; color: #C8F135; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Ver resposta →
                </a>
              </p>
              <p style="font-size: 11px; color: #999; margin-top: 24px;">FightPort — sistema automático</p>
            </div>
          `,
        });
      })();

      setReply('');
      qc.invalidateQueries({ queryKey: ['admin-ticket-messages', selectedId] });
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-awaiting-count'] });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const resolveTicket = useMutation({
    mutationFn: async () => {
      if (!selectedId) return;
      const { error } = await supabase.rpc('admin_resolve_ticket', { p_ticket_id: selectedId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tickets'] });
      qc.invalidateQueries({ queryKey: ['admin-awaiting-count'] });
      toast({ title: 'Ticket marcado como resolvido' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const selected = useMemo(
    () => tickets.find(tk => tk.id === selectedId),
    [tickets, selectedId],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10" style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', margin: 0, color: 'var(--color-text)' }}>
            {t('dash.support.title')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            {t('dash.support.subtitle')}
          </p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...ipt, width: '100%', maxWidth: 240 }}>
          <option value="open">{t('dash.support.filters.open')}</option>
          <option value="awaiting_school">{t('dash.support.filters.awaitingSchool')}</option>
          <option value="resolved">{t('dash.support.filters.resolved')}</option>
          <option value="all">{t('dash.support.filters.all')}</option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 380px) 1fr',
          gap: 16,
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <TicketThread
          ticket={selected}
          messages={messages}
          reply={reply}
          onReplyChange={setReply}
          onSend={() => sendReply.mutate()}
          isSending={sendReply.isPending}
          onResolve={() => resolveTicket.mutate()}
          onBack={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}
