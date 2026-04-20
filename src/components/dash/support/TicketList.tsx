import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import {
  SupportTicket,
  SUPPORT_STATUS_COLORS,
  SUPPORT_STATUS_LABEL_KEYS,
} from './types';

type Props = {
  tickets: SupportTicket[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function TicketList({ tickets, isLoading, selectedId, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={selectedId ? 'hidden lg:flex' : 'flex'}
      style={{
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', flexDirection: 'column',
      }}
    >
      {isLoading && (
        <div style={{ padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
          Carregando…
        </div>
      )}
      {!isLoading && tickets.length === 0 && (
        <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center' }}>
          <MessageSquare style={{ width: 24, height: 24, margin: '0 auto 8px', opacity: 0.5 }} />
          {t('dash.support.empty')}
        </div>
      )}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {tickets.map(ticket => {
          const active = selectedId === ticket.id;
          const sc = SUPPORT_STATUS_COLORS[ticket.status] ?? SUPPORT_STATUS_COLORS.open;
          return (
            <button
              key={ticket.id}
              onClick={() => onSelect(ticket.id)}
              style={{
                width: '100%', textAlign: 'left', padding: 12, border: 'none',
                borderBottom: '1px solid var(--color-border)',
                background: active ? 'var(--color-bg-soft)' : 'transparent', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.school_name}
                </span>
                {ticket.unread_for_admin > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 10, padding: '1px 6px', borderRadius: 999,
                    background: '#0D0D0D', color: '#C8F135', fontWeight: 600,
                  }}>
                    {ticket.unread_for_admin}
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ticket.subject}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ticket.preview ?? '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  background: sc.bg, color: sc.fg,
                }}>
                  {t(SUPPORT_STATUS_LABEL_KEYS[ticket.status] ?? SUPPORT_STATUS_LABEL_KEYS.open)}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--color-text-muted)' }}>
                  {format(new Date(ticket.last_message_at), 'dd/MM HH:mm')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
