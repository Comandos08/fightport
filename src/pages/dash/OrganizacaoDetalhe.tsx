import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Ban, RefreshCw, Gift, Users, Award, DollarSign, FileSearch, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DashPageHeader } from '@/components/dash/DashPageHeader';
import { DashSection } from '@/components/dash/DashSection';
import { dashOutlineButtonStyle } from '@/components/dash/DashFiltersBar';
import { DashBackLink } from '@/components/dash/DashBackLink';
import { DashTable, dashTd } from '@/components/dash/DashTable';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);

const muted: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)',
};
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block',
};
const val: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)',
};

export default function OrganizacaoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [showSuspend, setShowSuspend] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [reason, setReason] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');

  const { data: detail, isLoading } = useQuery({
    queryKey: ['admin-school', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_school', { p_school_id: id });
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: practitioners = [] } = useQuery({
    queryKey: ['admin-school-practitioners', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_school_practitioners', { p_school_id: id });
      if (error) throw error; return data ?? [];
    },
    enabled: !!id,
  });
  const { data: achievements = [] } = useQuery({
    queryKey: ['admin-school-achievements', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_school_achievements', { p_school_id: id });
      if (error) throw error; return data ?? [];
    },
    enabled: !!id,
  });
  const { data: txs = [] } = useQuery({
    queryKey: ['admin-school-tx', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_school_transactions', { p_school_id: id });
      if (error) throw error; return data ?? [];
    },
    enabled: !!id,
  });
  const { data: tickets = [] } = useQuery({
    queryKey: ['admin-school-tickets', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_school_tickets', { p_school_id: id });
      if (error) throw error; return data ?? [];
    },
    enabled: !!id,
  });
  const { data: audit = [] } = useQuery({
    queryKey: ['admin-school-audit', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_school_audit', { p_school_id: id });
      if (error) throw error; return data ?? [];
    },
    enabled: !!id,
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-school', id] });
    qc.invalidateQueries({ queryKey: ['admin-school-tx', id] });
    qc.invalidateQueries({ queryKey: ['admin-school-audit', id] });
    qc.invalidateQueries({ queryKey: ['admin-list-schools'] });
  };

  const suspendMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('admin_suspend_school', { p_school_id: id, p_reason: reason });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Organização suspensa'); setShowSuspend(false); setReason(''); invalidateAll(); },
    onError: (e: any) => toast.error(e.message ?? 'Erro ao suspender'),
  });
  const reactivateMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('admin_reactivate_school', { p_school_id: id, p_reason: reason });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Organização reativada'); setShowReactivate(false); setReason(''); invalidateAll(); },
    onError: (e: any) => toast.error(e.message ?? 'Erro ao reativar'),
  });
  const bonusMut = useMutation({
    mutationFn: async () => {
      const amt = parseInt(bonusAmount, 10);
      if (!amt || amt <= 0) throw new Error('Quantidade inválida');
      const { error } = await supabase.rpc('admin_grant_bonus_credits', {
        p_school_id: id, p_amount: amt, p_reason: bonusReason,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success('Créditos concedidos'); setShowBonus(false); setBonusAmount(''); setBonusReason(''); invalidateAll(); },
    onError: (e: any) => toast.error(e.message ?? 'Erro ao conceder créditos'),
  });

  if (isLoading) return <div style={{ padding: 32, ...muted }}>Carregando...</div>;
  if (!detail?.school) return <div style={{ padding: 32, ...muted }}>Organização não encontrada</div>;

  const s = detail.school;
  const hc = detail.head_coach;

  const headerActions = (
    <>
      <button onClick={() => setShowBonus(true)} style={dashOutlineButtonStyle}>
        <Gift style={{ width: 14, height: 14 }} /> Conceder cortesia
      </button>
      {s.is_suspended ? (
        <button onClick={() => setShowReactivate(true)} style={dashOutlineButtonStyle}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Reativar
        </button>
      ) : (
        <button
          onClick={() => setShowSuspend(true)}
          style={{ ...dashOutlineButtonStyle, color: '#dc2626', borderColor: 'rgba(220,38,38,0.4)' }}
        >
          <Ban style={{ width: 14, height: 14 }} /> Suspender
        </button>
      )}
    </>
  );

  const subtitle = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{
        display: 'inline-block', padding: '2px 8px', fontSize: 11, fontWeight: 500,
        borderRadius: 4,
        color: s.is_suspended ? '#dc2626' : '#16a34a',
        background: s.is_suspended ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)',
      }}>{s.is_suspended ? 'Suspensa' : 'Ativa'}</span>
      {s.is_admin && <span style={{ display: 'inline-block', padding: '2px 8px', fontSize: 11, fontWeight: 500, borderRadius: 4, background: 'var(--color-text)', color: 'var(--color-bg)' }}>Admin</span>}
      <span>{s.martial_art}</span>
      {(s.city || s.state) && <span>· {[s.city, s.state].filter(Boolean).join(' / ')}</span>}
      {s.is_suspended && s.suspended_reason && <span>· Motivo: {s.suspended_reason}</span>}
    </span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <DashBackLink to="/dash/organizacoes" label="Voltar para organizações" />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {s.logo_url ? (
          <img src={s.logo_url} alt={s.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <DashPageHeader title={s.name} subtitle={subtitle} actions={headerActions} />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <DashSection title="Dados cadastrais">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div><span style={lbl}>Nome</span><span style={val}>{s.name}</span></div>
            <div><span style={lbl}>Arte marcial</span><span style={val}>{s.martial_art}</span></div>
            <div><span style={lbl}>Cidade/UF</span><span style={val}>{[s.city, s.state].filter(Boolean).join(' / ') || '—'}</span></div>
            <div><span style={lbl}>Email</span><span style={val}>{s.email}</span></div>
            <div><span style={lbl}>Cadastro</span><span style={val}>{format(new Date(s.created_at), 'dd/MM/yyyy')}</span></div>
            <div><span style={lbl}>Head coach</span><span style={val}>{hc ? `${hc.name} · ${hc.graduation}` : '—'}</span></div>
          </div>
        </DashSection>

        <DashSection title="Créditos">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <span style={lbl}>Saldo</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>{detail.balance}</div>
            </div>
            <div>
              <span style={lbl}>Total comprado</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>{detail.total_purchased_credits}</div>
            </div>
            <div>
              <span style={lbl}>Total consumido</span>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>{detail.total_used_credits}</div>
            </div>
          </div>
          <div style={{ ...muted, marginTop: 12 }}>Total gasto: {fmtBRL(Number(detail.total_spent_brl))}</div>
        </DashSection>
      </div>

      <DashSection title={`Atletas (${practitioners.length})`} flush>
        <DashTable
          bare
          headers={['FP-ID', 'Nome', 'Faixa', 'Modalidade', 'Cadastro']}
          isEmpty={practitioners.length === 0}
          emptyIcon={Users}
          emptyTitle="Nenhum atleta cadastrado"
        >
          {practitioners.slice(0, 20).map((p: any) => (
            <tr key={p.id}>
              <td style={dashTd}>{p.fp_id}</td>
              <td style={dashTd}>{p.first_name} {p.last_name}</td>
              <td style={dashTd}>{p.current_belt ?? '—'}</td>
              <td style={dashTd}>{p.martial_art}</td>
              <td style={{ ...dashTd, color: 'var(--color-text-muted)' }}>{format(new Date(p.created_at), 'dd/MM/yyyy')}</td>
            </tr>
          ))}
        </DashTable>
        {practitioners.length > 20 && <p style={{ ...muted, padding: '8px 20px 16px' }}>Mostrando 20 de {practitioners.length}</p>}
      </DashSection>

      <DashSection title={`Graduações emitidas (${achievements.length})`} flush>
        <DashTable
          bare
          headers={['Data', 'Atleta', 'Faixa', 'Grau', 'Graduado por']}
          isEmpty={achievements.length === 0}
          emptyIcon={Award}
          emptyTitle="Nenhuma graduação emitida"
        >
          {achievements.slice(0, 20).map((a: any) => (
            <tr key={a.id}>
              <td style={dashTd}>{format(new Date(a.graduation_date), 'dd/MM/yyyy')}</td>
              <td style={dashTd}>{a.practitioner_name}</td>
              <td style={dashTd}>{a.belt}</td>
              <td style={dashTd}>{a.degree ?? 0}</td>
              <td style={{ ...dashTd, color: 'var(--color-text-muted)' }}>{a.graduated_by}</td>
            </tr>
          ))}
        </DashTable>
        {achievements.length > 20 && <p style={{ ...muted, padding: '8px 20px 16px' }}>Mostrando 20 de {achievements.length}</p>}
      </DashSection>

      <DashSection title="Histórico financeiro" flush>
        <DashTable
          bare
          headers={['Data', 'Tipo', 'Pacote', 'Quantidade', 'Valor', 'Status']}
          isEmpty={txs.length === 0}
          emptyIcon={DollarSign}
          emptyTitle="Nenhuma transação"
        >
          {txs.map((t: any) => (
            <tr key={t.id}>
              <td style={dashTd}>{format(new Date(t.created_at), 'dd/MM/yyyy HH:mm')}</td>
              <td style={dashTd}>{t.type === 'purchase' ? 'Compra' : t.type === 'usage' ? 'Uso' : t.type === 'bonus' ? 'Cortesia' : t.type}</td>
              <td style={{ ...dashTd, color: 'var(--color-text-muted)' }}>{t.package_name ?? '—'}</td>
              <td style={{ ...dashTd, fontVariantNumeric: 'tabular-nums' }}>{t.amount > 0 ? '+' : ''}{t.amount}</td>
              <td style={{ ...dashTd, fontVariantNumeric: 'tabular-nums' }}>{t.price_brl ? fmtBRL(t.price_brl) : '—'}</td>
              <td style={{ ...dashTd, color: 'var(--color-text-muted)' }}>{t.status}</td>
            </tr>
          ))}
        </DashTable>
      </DashSection>

      <DashSection title={`Tickets de suporte abertos (${tickets.length})`}>
        {tickets.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '24px 0', color: 'var(--color-text-muted)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: 16, height: 16 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>Nenhum ticket em aberto</span>
          </div>
        ) : (
          <ul className="flex flex-col" style={{ gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
            {tickets.map((t: any) => (
              <li key={t.id} style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 6 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{t.subject}</span>
                  <span style={muted}>{format(new Date(t.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashSection>

      <DashSection title="Histórico de ações administrativas" flush>
        <DashTable
          bare
          headers={['Data', 'Admin', 'Ação', 'Detalhes']}
          isEmpty={audit.length === 0}
          emptyIcon={FileSearch}
          emptyTitle="Nenhuma ação registrada"
        >
          {audit.map((a: any) => (
            <tr key={a.id}>
              <td style={dashTd}>{format(new Date(a.created_at), 'dd/MM/yyyy HH:mm')}</td>
              <td style={dashTd}>{a.admin_name}</td>
              <td style={dashTd}>{a.action}</td>
              <td style={{ ...dashTd, color: 'var(--color-text-muted)', whiteSpace: 'normal' }}>
                {a.metadata ? Object.entries(a.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ') : '—'}
              </td>
            </tr>
          ))}
        </DashTable>
      </DashSection>

      {/* Dialog: Suspender */}
      <Dialog
        open={showSuspend}
        onOpenChange={(o) => { setShowSuspend(o); if (!o) setReason(''); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender organização</DialogTitle>
            <DialogDescription>
              A organização perderá acesso ao painel. Os dados são preservados e a ação fica registrada no audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Motivo *</Label>
            <Textarea
              id="suspend-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo da suspensão"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSuspend(false); setReason(''); }}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => suspendMut.mutate()}
              disabled={!reason.trim() || suspendMut.isPending}
            >
              Suspender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reativar */}
      <Dialog
        open={showReactivate}
        onOpenChange={(o) => { setShowReactivate(o); if (!o) setReason(''); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reativar organização</DialogTitle>
            <DialogDescription>
              A organização voltará a ter acesso ao painel. A ação fica registrada no audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reactivate-reason">Motivo *</Label>
            <Textarea
              id="reactivate-reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o motivo da reativação"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReactivate(false); setReason(''); }}>Cancelar</Button>
            <Button
              onClick={() => reactivateMut.mutate()}
              disabled={!reason.trim() || reactivateMut.isPending}
            >
              Reativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Conceder créditos de cortesia */}
      <Dialog
        open={showBonus}
        onOpenChange={(o) => { setShowBonus(o); if (!o) { setBonusAmount(''); setBonusReason(''); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conceder créditos de cortesia</DialogTitle>
            <DialogDescription>
              Os créditos serão adicionados ao saldo da organização. A ação fica registrada no audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bonus-amount">Quantidade *</Label>
              <Input
                id="bonus-amount"
                type="number"
                min={1}
                value={bonusAmount}
                onChange={e => setBonusAmount(e.target.value)}
                placeholder="Ex.: 10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus-reason">Motivo *</Label>
              <Textarea
                id="bonus-reason"
                value={bonusReason}
                onChange={e => setBonusReason(e.target.value)}
                placeholder="Justificativa para o bônus"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBonus(false); setBonusAmount(''); setBonusReason(''); }}>Cancelar</Button>
            <Button
              onClick={() => bonusMut.mutate()}
              disabled={!bonusAmount || !bonusReason.trim() || bonusMut.isPending}
            >
              Conceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
