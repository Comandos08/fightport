import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { notifyAdmin } from '@/lib/notifications';

const CATEGORIES = [
  { value: 'bug', label: 'Bug' },
  { value: 'duvida', label: 'Dúvida' },
  { value: 'creditos', label: 'Créditos' },
  { value: 'cadastro', label: 'Cadastro' },
  { value: 'outro', label: 'Outro' },
];

const STATUS_LABEL: Record<string, string> = {
  open: 'Aberto',
  awaiting_admin: 'Aguardando suporte',
  awaiting_school: 'Aguardando você',
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

export default function PainelSuporte() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('duvida');
  const [newMessage, setNewMessage] = useState('');
  const [reply, setReply] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  // Lista de tickets da escola
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['school-tickets', user?.id, statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('support_tickets')
        .select('*')
        .eq('school_id', user!.id)
        .order('last_message_at', { ascending: false });
      if (statusFilter === 'open') q = q.in('status', ['open', 'awaiting_admin', 'awaiting_school']);
      else if (statusFilter === 'resolved') q = q.in('status', ['resolved', 'closed']);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  // Mensagens do ticket selecionado
  const { data: messages = [] } = useQuery({
    queryKey: ['school-ticket-messages', selectedId],
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

  // Marca como lidas as mensagens recebidas pela escola ao abrir o ticket
  useEffect(() => {
    if (!selectedId) return;
    supabase.rpc('mark_messages_read', { p_ticket_id: selectedId, p_role: 'school' }).then(() => {
      qc.invalidateQueries({ queryKey: ['school-unread-count'] });
    });
  }, [selectedId, qc]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages.length, selectedId]);

  const createTicket = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Sem usuário');
      const subject = newSubject.trim();
      const message = newMessage.trim();
      if (!subject || !message) throw new Error('Assunto e mensagem são obrigatórios');

      const { data: ticket, error: e1 } = await supabase
        .from('support_tickets')
        .insert({ school_id: user.id, subject, category: newCategory, status: 'awaiting_admin' })
        .select()
        .single();
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from('support_messages')
        .insert({ ticket_id: ticket.id, author_type: 'school', author_id: user.id, content: message });
      if (e2) throw e2;

      return ticket;
    },
    onSuccess: (ticket) => {
      // Notifica admin (fire-and-forget) — busca nome da escola
      (async () => {
        const { data: schoolRow } = await supabase
          .from('schools')
          .select('name')
          .eq('id', user!.id)
          .maybeSingle();
        notifyAdmin({
          type: 'new_ticket',
          title: 'Novo ticket de suporte',
          body: `A escola "${schoolRow?.name ?? 'desconhecida'}" abriu um novo ticket: "${ticket.subject}".`,
          link: '/dash/suporte',
        });
      })();
      qc.invalidateQueries({ queryKey: ['school-tickets'] });
      setNewOpen(false);
      setNewSubject(''); setNewCategory('duvida'); setNewMessage('');
      setSelectedId(ticket.id);
      toast({ title: 'Ticket criado', description: 'Nossa equipe responderá em breve.' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!user || !selectedId) throw new Error('Sem ticket selecionado');
      const content = reply.trim();
      if (!content) throw new Error('Mensagem vazia');
      const { error } = await supabase
        .from('support_messages')
        .insert({ ticket_id: selectedId, author_type: 'school', author_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply('');
      qc.invalidateQueries({ queryKey: ['school-ticket-messages', selectedId] });
      qc.invalidateQueries({ queryKey: ['school-tickets'] });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const selected = useMemo(() => tickets.find((t: any) => t.id === selectedId), [tickets, selectedId]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 22, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
            Suporte
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Abra tickets para tirar dúvidas, reportar bugs ou pedir ajuda.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={ipt}>
            <option value="all">Todos</option>
            <option value="open">Em aberto</option>
            <option value="resolved">Resolvidos</option>
          </select>
          <Button onClick={() => setNewOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Novo ticket
          </Button>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 16,
        minHeight: 'calc(100vh - 240px)',
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
              Nenhum ticket {statusFilter === 'open' ? 'em aberto' : statusFilter === 'resolved' ? 'resolvido' : ''}.
            </div>
          )}
          {(tickets as any[]).map(t => {
            const active = selectedId === t.id;
            const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS.open;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                style={{
                  textAlign: 'left', padding: 12, border: 'none', borderBottom: '1px solid var(--color-border)',
                  background: active ? 'var(--color-bg-soft)' : 'transparent', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.subject}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-sans)', fontSize: 10, padding: '2px 6px', borderRadius: 4,
                    background: sc.bg, color: sc.fg, whiteSpace: 'nowrap',
                  }}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {format(new Date(t.last_message_at), 'dd/MM/yyyy HH:mm')} · {t.category}
                </div>
              </button>
            );
          })}
        </div>

        {/* Thread */}
        <div style={{
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md, 8px)', display: 'flex', flexDirection: 'column',
          minHeight: 400,
        }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
              Selecione um ticket para ver a conversa.
            </div>
          ) : (
            <>
              <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>{selected.subject}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {selected.category} · {STATUS_LABEL[selected.status]} · aberto em {format(new Date(selected.created_at), 'dd/MM/yyyy')}
                </div>
              </div>
              <div ref={threadRef} style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(messages as any[]).map(m => {
                  const isMine = m.author_type === 'school';
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
                          {isMine ? 'Você' : 'Suporte'} · {format(new Date(m.created_at), 'dd/MM HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 13, textAlign: 'center' }}>Nenhuma mensagem.</div>
                )}
              </div>
              {selected.status !== 'resolved' && selected.status !== 'closed' && (
                <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Escreva sua resposta…"
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

      {/* Modal novo ticket */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir novo ticket</DialogTitle>
            <DialogDescription>Descreva sua questão. Nossa equipe responde por aqui mesmo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="t-subject">Assunto *</Label>
              <Input id="t-subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Ex.: Erro ao registrar graduação" />
            </div>
            <div>
              <Label htmlFor="t-cat">Categoria</Label>
              <select
                id="t-cat" value={newCategory} onChange={e => setNewCategory(e.target.value)}
                style={{ ...ipt, width: '100%' }}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="t-msg">Mensagem *</Label>
              <Textarea id="t-msg" rows={5} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Detalhe sua dúvida ou problema…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
            <Button onClick={() => createTicket.mutate()} disabled={createTicket.isPending}>Abrir ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
