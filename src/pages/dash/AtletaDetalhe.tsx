import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Eye, EyeOff, Pencil, Award, Hash, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { maskCpf, maskBirthDate, formatCpf, formatBirthDate } from '@/lib/sensitive';
import { DashPageHeader } from '@/components/dash/DashPageHeader';
import { DashSection } from '@/components/dash/DashSection';
import { dashOutlineButtonStyle } from '@/components/dash/DashFiltersBar';

const REVEAL_MS = 60_000;

const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block',
};
const val: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)',
};

const EDITABLE_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: 'first_name', label: 'Nome' },
  { key: 'last_name', label: 'Sobrenome' },
  { key: 'cpf', label: 'CPF' },
  { key: 'birth_date', label: 'Data de nascimento', type: 'date' },
  { key: 'gender', label: 'Gênero' },
  { key: 'father_name', label: 'Nome do pai' },
  { key: 'mother_name', label: 'Nome da mãe' },
  { key: 'photo_url', label: 'URL da foto' },
  { key: 'current_belt', label: 'Faixa atual' },
  { key: 'martial_art', label: 'Arte marcial' },
];

export default function AtletaDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [revealed, setRevealed] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealReason, setRevealReason] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [editReason, setEditReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-get-practitioner', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_practitioner', { p_practitioner_id: id });
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['admin-practitioner-achievements', id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_practitioner_achievements', { p_practitioner_id: id });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const p = data?.practitioner;
  const school = data?.school;

  // Auto re-mask após 60s
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setRevealed(false), REVEAL_MS);
    return () => clearTimeout(t);
  }, [revealed]);

  const revealMutation = useMutation({
    mutationFn: async (reason: string) => {
      const { error } = await supabase.rpc('admin_log_action', {
        p_action: 'reveal_sensitive_data',
        p_target_type: 'practitioner',
        p_target_id: id,
        p_metadata: { reason, fields: ['cpf', 'birth_date'] },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setRevealed(true);
      setRevealOpen(false);
      setRevealReason('');
      toast({ title: 'Dados revelados', description: 'Re-mascaramento automático em 60 segundos.' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const editMutation = useMutation({
    mutationFn: async ({ changes, reason }: { changes: Record<string, any>; reason: string }) => {
      const { error } = await supabase.rpc('admin_update_practitioner', {
        p_practitioner_id: id,
        p_changes: changes,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-get-practitioner', id] });
      setEditOpen(false);
      setEditReason('');
      toast({ title: 'Atleta atualizado', description: 'Alterações registradas no audit log.' });
    },
    onError: (e: any) => toast({ title: 'Erro', description: e.message, variant: 'destructive' }),
  });

  const openEdit = () => {
    if (!p) return;
    const init: Record<string, string> = {};
    for (const f of EDITABLE_FIELDS) init[f.key] = p[f.key] ?? '';
    setEditValues(init);
    setEditReason('');
    setEditOpen(true);
  };

  const submitEdit = () => {
    if (!editReason.trim()) {
      toast({ title: 'Motivo obrigatório', variant: 'destructive' });
      return;
    }
    const changes: Record<string, any> = {};
    for (const f of EDITABLE_FIELDS) {
      const newV = editValues[f.key] ?? '';
      const oldV = (p?.[f.key] ?? '') as string;
      if (String(newV) !== String(oldV)) changes[f.key] = newV === '' ? null : newV;
    }
    if (Object.keys(changes).length === 0) {
      toast({ title: 'Nenhuma alteração detectada' });
      return;
    }
    editMutation.mutate({ changes, reason: editReason.trim() });
  };

  if (isLoading) {
    return <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>Carregando…</div>;
  }
  if (!p) {
    return <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>Atleta não encontrado.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Voltar */}
      <DashBackLink to="/dash/atletas" label="Voltar para atletas" />

      {/* Cabeçalho padrão */}
      <DashPageHeader
        title={`${p.first_name} ${p.last_name}`}
        subtitle={
          <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{p.fp_id}</span>
        }
        actions={
          <button onClick={openEdit} style={dashOutlineButtonStyle}>
            <Pencil style={{ width: 14, height: 14 }} /> Editar
          </button>
        }
      />

      {/* Dados cadastrais + sensíveis */}
      <DashSection
        title="Dados cadastrais"
        actions={
          <button
            onClick={() => revealed ? setRevealed(false) : setRevealOpen(true)}
            style={{
              ...dashOutlineButtonStyle,
              ...(revealed ? { color: '#dc2626', borderColor: '#dc2626' } : {}),
            }}
          >
            {revealed
              ? (<><EyeOff style={{ width: 14, height: 14 }} /> Re-mascarar</>)
              : (<><Eye style={{ width: 14, height: 14 }} /> Revelar dados sensíveis</>)}
          </button>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20 }}>
          {p.photo_url ? (
            <img src={p.photo_url} alt={`${p.first_name}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--color-border)' }} />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: 'var(--radius-md, 8px)', background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 11 }}>
              Sem foto
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div><span style={lbl}>Nome completo</span><span style={val}>{p.first_name} {p.last_name}</span></div>
            <div><span style={lbl}>Gênero</span><span style={val}>{p.gender ?? '—'}</span></div>
            <div>
              <span style={lbl}>CPF {revealed && <span style={{ color: 'var(--color-warn, #c08a00)', textTransform: 'none', letterSpacing: 0 }}> (visível)</span>}</span>
              <span style={{ ...val, fontFamily: 'var(--font-mono, monospace)' }}>
                {revealed ? formatCpf(p.cpf) : maskCpf(p.cpf)}
              </span>
            </div>
            <div>
              <span style={lbl}>Data de nascimento</span>
              <span style={{ ...val, fontFamily: 'var(--font-mono, monospace)' }}>
                {revealed ? formatBirthDate(p.birth_date) : maskBirthDate(p.birth_date)}
              </span>
            </div>
            <div><span style={lbl}>Arte marcial</span><span style={val}>{p.martial_art}</span></div>
            <div><span style={lbl}>Faixa atual</span><span style={val}>{p.current_belt ?? '—'}</span></div>
            <div><span style={lbl}>Nome do pai</span><span style={val}>{p.father_name ?? '—'}</span></div>
            <div><span style={lbl}>Nome da mãe</span><span style={val}>{p.mother_name ?? '—'}</span></div>
            <div><span style={lbl}>Cadastro</span><span style={val}>{format(new Date(p.created_at), 'dd/MM/yyyy')}</span></div>
            <div>
              <span style={lbl}>Escola de origem</span>
              {school ? (
                <Link to={`/dash/organizacoes/${school.id}`} style={{ ...val, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Building2 style={{ width: 14, height: 14 }} /> {school.name}
                </Link>
              ) : <span style={val}>—</span>}
            </div>
          </div>
        </div>
      </DashSection>

      {/* Histórico de graduações */}
      <DashSection
        title={
          <>
            <Award style={{ width: 16, height: 16 }} /> Histórico de graduações
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              (imutáveis — somente leitura)
            </span>
          </>
        }
      >
        {achievements.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)' }}>Nenhuma graduação registrada.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(achievements as any[]).map(a => (
              <div key={a.id} style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)',
                padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ ...val, fontWeight: 600 }}>
                      {a.belt}{a.degree ? ` · ${a.degree}° grau` : ''}
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {format(new Date(a.graduation_date), 'dd/MM/yyyy')} · graduado por {a.graduated_by}
                    </div>
                  </div>
                  {a.school_id && (
                    <Link to={`/dash/organizacoes/${a.school_id}`} style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Building2 style={{ width: 12, height: 12 }} /> {a.school_name ?? 'escola'}
                    </Link>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
                  <Hash style={{ width: 12, height: 12, flexShrink: 0 }} /> {a.hash}
                </div>
                {a.notes && (
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {a.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashSection>

      {/* Dialog: Revelar */}
      <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revelar dados sensíveis</DialogTitle>
            <DialogDescription>
              Esta ação fica registrada no audit log. CPF e data de nascimento ficarão visíveis por 60 segundos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reveal-reason">Motivo *</Label>
            <Textarea
              id="reveal-reason"
              value={revealReason}
              onChange={e => setRevealReason(e.target.value)}
              placeholder="Ex.: Verificação solicitada pela escola por divergência de cadastro"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevealOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => revealMutation.mutate(revealReason.trim())}
              disabled={!revealReason.trim() || revealMutation.isPending}
            >
              Revelar por 60s
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar atleta</DialogTitle>
            <DialogDescription>
              Cada campo alterado será registrado no audit log com valor antigo e novo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EDITABLE_FIELDS.map(f => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={`f-${f.key}`}>{f.label}</Label>
                <Input
                  id={`f-${f.key}`}
                  type={f.type ?? 'text'}
                  value={editValues[f.key] ?? ''}
                  onChange={e => setEditValues(v => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-reason">Motivo *</Label>
            <Textarea
              id="edit-reason"
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
              placeholder="Ex.: Correção solicitada pelo titular"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={submitEdit} disabled={editMutation.isPending}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
