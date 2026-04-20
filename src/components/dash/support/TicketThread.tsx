import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ArrowLeft, Building2, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SupportMessage,
  SupportTicket,
  SUPPORT_STATUS_LABEL_KEYS,
} from './types';

type Props = {
  ticket: SupportTicket | undefined;
  messages: SupportMessage[];
  reply: string;
  onReplyChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  onResolve: () => void;
  onBack: () => void;
};

export function TicketThread({
  ticket, messages, reply, onReplyChange, onSend, isSending, onResolve, onBack,
}: Props) {
  const { t } = useTranslation();
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages.length, ticket?.id]);

  return (
    <div
      className={ticket ? 'flex' : 'hidden lg:flex'}
      style={{
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)', flexDirection: 'column',
      }}
    >
      {!ticket ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
          {t('dash.support.selectTicket')}
        </div>
      ) : (
        <>
          <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0 }}>
              <button
                type="button"
                onClick={onBack}
                className="lg:hidden cursor-pointer"
                aria-label="Voltar para lista"
                style={{
                  background: 'transparent', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm, 6px)', padding: '6px 8px',
                  color: 'var(--color-text-muted)', flexShrink: 0,
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                  {ticket.subject}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Link to={`/dash/organizacoes/${ticket.school_id}`} style={{ color: 'var(--color-text)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Building2 style={{ width: 12, height: 12 }} /> {ticket.school_name}
                  </Link>
                  <span>· {ticket.category} · {t(SUPPORT_STATUS_LABEL_KEYS[ticket.status] ?? SUPPORT_STATUS_LABEL_KEYS.open)}</span>
                </div>
              </div>
            </div>
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <Button variant="outline" size="sm" onClick={onResolve}>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como resolvido
              </Button>
            )}
          </div>

          <div ref={threadRef} style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(m => {
              const isMine = m.author_type === 'admin';
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '8px 12px',
                    borderRadius: 12, background: isMine ? '#0D0D0D' : 'var(--color-bg-soft)',
                    color: isMine ? '#fff' : 'var(--color-text)',
                    fontFamily: 'var(--font-sans)', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    <div>{m.content}</div>
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                      {isMine ? 'Suporte' : 'Escola'} · {format(new Date(m.created_at), 'dd/MM HH:mm')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
              <textarea
                value={reply}
                onChange={e => onReplyChange(e.target.value)}
                placeholder={t('dash.support.reply.placeholder')}
                rows={2}
                style={{
                  flex: 1, padding: 10, fontFamily: 'var(--font-sans)', fontSize: 13,
                  background: 'var(--color-bg)', color: 'var(--color-text)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', resize: 'vertical',
                }}
              />
              <Button onClick={onSend} disabled={!reply.trim() || isSending}>
                <Send className="w-4 h-4 mr-2" /> {t('dash.support.reply.send')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
