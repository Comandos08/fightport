import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Send, CheckCircle2, MessageSquare, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  awaiting_admin: 'Aguardando suporte',
  awaiting_school: 'Aguardando escola',
  resolved: 'Resolvido',
  closed: 'Encerrado',
};
const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  open:            { bg: '#fde68a', fg: '#92400e' },
  awaiting_admin:  { bg: '#fde68a', fg: '#92400e' },
  awaiting_school: { bg: '#bfdbfe', fg: '#1e40af' },
  resolved:        { bg: '#bbf7d0', fg: '#166534' },
  closed:          { bg: '#e5e7eb', fg: '#374151' },
};
const ipt: React.CSSProperties = {
  height: 32, padding: '0 10px', fontFamily: 'var(--font-sans)', fontSize: 13,
  background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm, 6px)', outline: 'none',
};

export default function DashSuporte() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_support_tickets', { p_status: statusFilter });
      if (error) throw error;
      return data ?? [];
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
      return data ?? [];
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

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages.length, selectedId]);

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

  const selected = useMemo(() => (tickets as any[]).find(t => t.id === selectedId), [tickets, selectedId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 22, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
            Suporte
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Tickets de todas as escolas. Selecione um para responder.
          </p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={ipt}>
          <option value="open">Abertos</option>
          <option value="awaiting_school">Aguardando escola</option>
          <option value="resolved">Resolvidos</option>
          <option value="all">Todos</option>
        </select>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: 16,
        minHeight: 'calc(100vh - 200px)',
      }}>
        {/* Lista */}
        <div style={{
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {isLoading && <div style={{ padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>Carregando…</div>}
          {!isLoading && tickets.length === 0 && (
            <div style={{ padding: 24, color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center' }}>
              <MessageSquare style={{ width: 24, height: 24, margin: '0 auto 8px', opacity: 0.5 }} />
              Nenhum ticket nesta categoria.
            </div>
          )}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {(tickets as any[]).map(t => {
              const active = selectedId === t.id;
              const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS.open;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: 12, border: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    background: active ? 'var(--color-bg-soft)' : 'transparent', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.school_name}
                    </span>
                    {t.unread_for_admin > 0 && (
                      <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: 10, padding: '1px 6px', borderRadius: 999,
                        background: '#0D0D0D', color: '#C8F135', fontWeight: 600,
                      }}>
                        {t.unread_for_admin}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.subject}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.preview ?? '—'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: sc.bg, color: sc.fg,
                    }}>
                      {STATUS_LABEL[t.status]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--color-text-muted)' }}>
                      {format(new Date(t.last_message_at), 'dd/MM HH:mm')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        <div style={{
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md, 8px)', display: 'flex', flexDirection: 'column',
        }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
              Selecione um ticket para ver a conversa.
            </div>
          ) : (
            <>
              <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                    {selected.subject}
                  </div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/dash/organizacoes/${selected.school_id}`} style={{ color: 'var(--color-text)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Building2 style={{ width: 12, height: 12 }} /> {selected.school_name}
                    </Link>
                    <span>· {selected.category} · {STATUS_LABEL[selected.status]}</span>
                  </div>
                </div>
                {selected.status !== 'resolved' && selected.status !== 'closed' && (
                  <Button variant="outline" size="sm" onClick={() => resolveTicket.mutate()}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como resolvido
                  </Button>
                )}
              </div>

              <div ref={threadRef} style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(messages as any[]).map(m => {
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

              {selected.status !== 'resolved' && selected.status !== 'closed' && (
                <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Escreva uma resposta…"
                    rows={2}
                    style={{
                      flex: 1, padding: 10, fontFamily: 'var(--font-sans)', fontSize: 13,
                      background: 'var(--color-bg)', color: 'var(--color-text)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', resize: 'vertical',
                    }}
                  />
                  <Button onClick={() => sendReply.mutate()} disabled={!reply.trim() || sendReply.isPending}>
                    <Send className="w-4 h-4 mr-2" /> Enviar
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
