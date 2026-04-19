import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { DashPageHeader } from '@/components/dash/DashPageHeader';
import {
  DashFiltersBar,
  dashInputStyle as ipt,
  dashLabelStyle as lbl,
  dashOutlineButtonStyle,
  dashClearButtonStyle,
} from '@/components/dash/DashFiltersBar';

const td: React.CSSProperties = { padding: '12px 10px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' };
const th: React.CSSProperties = { padding: '10px', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', textAlign: 'left', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' };

const ACTION_LABELS: Record<string, string> = {
  'school.suspend': 'Suspendeu organização',
  'school.reactivate': 'Reativou organização',
  'school.grant_bonus': 'Concedeu créditos de cortesia',
  'practitioner.update': 'Editou atleta',
  'reveal_sensitive_data': 'Revelou dados sensíveis',
  'reveal_cpf': 'Revelou CPF',
  'reveal_birth_date': 'Revelou data de nascimento',
};

const TARGET_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'school', label: 'Organização' },
  { value: 'practitioner', label: 'Atleta' },
  { value: 'achievement', label: 'Graduação' },
];

const friendlyAction = (a: string) => ACTION_LABELS[a] ?? a;

const fmtDateTime = (s: string) => {
  const d = new Date(s);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
};

type Row = {
  id: string; created_at: string; admin_id: string; admin_name: string;
  action: string; target_type: string | null; target_id: string | null; target_name: string | null;
  metadata: Record<string, unknown> | null; ip_address: string | null; user_agent: string | null;
  total_count: number;
};

export default function Auditoria() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [targetType, setTargetType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Row | null>(null);
  const limit = 50;

  const filters = useMemo(() => ({
    p_search: search || null,
    p_action: action || null,
    p_target_type: targetType || null,
    p_target_id: null,
    p_date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
    p_date_to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : null,
    p_limit: limit,
    p_offset: page * limit,
  }), [search, action, targetType, dateFrom, dateTo, page]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-list-audit-log', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_audit_log', filters);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['admin-audit-log-actions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_audit_log_actions');
      if (error) throw error;
      return (data ?? []) as unknown as { action: string }[];
    },
  });

  const total = rows[0]?.total_count ?? 0;
  const totalPages = Math.ceil(Number(total) / limit) || 1;

  const clearFilters = () => {
    setSearch(''); setAction(''); setTargetType('');
    setDateFrom(''); setDateTo(''); setPage(0);
  };

  const targetLink = (r: Row) => {
    if (!r.target_type || !r.target_id) return null;
    if (r.target_type === 'school') return `/dash/organizacoes/${r.target_id}`;
    if (r.target_type === 'practitioner') return `/dash/atletas/${r.target_id}`;
    return null;
  };

  const exportCsv = async () => {
    // Busca tudo do filtro atual (até 5000 registros)
    const { data, error } = await supabase.rpc('admin_list_audit_log', { ...filters, p_limit: 5000, p_offset: 0 });
    if (error) { alert('Erro ao exportar: ' + error.message); return; }
    const items = (data ?? []) as unknown as Row[];
    const headers = ['Data/Hora', 'Admin', 'Ação', 'Tipo de alvo', 'ID do alvo', 'Nome do alvo', 'IP', 'User Agent', 'Metadata'];
    const escape = (v: unknown) => {
      const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = [
      headers.join(','),
      ...items.map(r => [
        fmtDateTime(r.created_at), r.admin_name, friendlyAction(r.action),
        r.target_type ?? '', r.target_id ?? '', r.target_name ?? '',
        r.ip_address ?? '', r.user_agent ?? '', r.metadata ?? {},
      ].map(escape).join(',')),
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <DashPageHeader
        title="Auditoria"
        subtitle="Registro imutável de todas as ações administrativas. Somente leitura."
        actions={
          <button onClick={exportCsv} style={dashOutlineButtonStyle}>
            <Download style={{ width: 14, height: 14 }} />
            Exportar CSV
          </button>
        }
      />

      <DashFiltersBar>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={lbl}>Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="ID, nome do alvo ou admin"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              style={{ ...ipt, paddingLeft: 32 }}
            />
          </div>
        </div>
        <div>
          <label style={lbl}>Ação</label>
          <select value={action} onChange={e => { setAction(e.target.value); setPage(0); }} style={ipt}>
            <option value="">Todas</option>
            {actions.map(a => (
              <option key={a.action} value={a.action}>{friendlyAction(a.action)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Tipo de alvo</label>
          <select value={targetType} onChange={e => { setTargetType(e.target.value); setPage(0); }} style={ipt}>
            {TARGET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>De</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} style={ipt} />
        </div>
        <div>
          <label style={lbl}>Até</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} style={ipt} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={clearFilters} style={dashClearButtonStyle}>Limpar</button>
        </div>
      </DashFiltersBar>

      {/* Tabela */}
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Data/Hora</th>
                <th style={th}>Admin</th>
                <th style={th}>Ação</th>
                <th style={th}>Alvo</th>
                <th style={th}>IP</th>
                <th style={{ ...th, textAlign: 'center' }}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td style={td} colSpan={6}>Carregando…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td style={td} colSpan={6}>Nenhum registro encontrado.</td></tr>
              ) : rows.map(r => {
                const link = targetLink(r);
                return (
                  <tr key={r.id}>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtDateTime(r.created_at)}</td>
                    <td style={td}>
                      <span title={r.user_agent ?? ''} style={{ borderBottom: r.user_agent ? '1px dotted var(--color-text-muted)' : 'none', cursor: r.user_agent ? 'help' : 'default' }}>
                        {r.admin_name}
                      </span>
                    </td>
                    <td style={td}>{friendlyAction(r.action)}</td>
                    <td style={td}>
                      {r.target_type && r.target_id ? (
                        link ? (
                          <Link to={link} style={{ color: 'var(--color-text)', textDecoration: 'underline' }}>
                            {r.target_name ?? r.target_id.slice(0, 8)}
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            {r.target_type}: {r.target_name ?? r.target_id.slice(0, 8)}
                          </span>
                        )
                      ) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </td>
                    <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{r.ip_address ?? '—'}</td>
                    <td style={{ ...td, textAlign: 'center' }}>
                      <button
                        onClick={() => setDetail(r)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '4px 10px', border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
                          fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500,
                          color: 'var(--color-text)', cursor: 'pointer',
                        }}
                      >
                        <Eye style={{ width: 12, height: 12 }} /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderTop: '1px solid var(--color-border)',
          fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)',
        }}>
          <span>
            {total > 0
              ? `Mostrando ${page * limit + 1}–${Math.min((page + 1) * limit, Number(total))} de ${total}`
              : 'Nenhum registro'}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1, color: 'var(--color-text)' }}
            ><ChevronLeft style={{ width: 14, height: 14 }} /></button>
            <span style={{ padding: '6px 12px' }}>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page + 1 >= totalPages}
              style={{ padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: page + 1 >= totalPages ? 0.4 : 1, color: 'var(--color-text)' }}
            ><ChevronRight style={{ width: 14, height: 14 }} /></button>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      {detail && (
        <div
          onClick={() => setDetail(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--color-text)' }}>
                Detalhes do registro
              </h2>
              <button onClick={() => setDetail(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'var(--font-sans)', fontSize: 13 }}>
              <Field label="Data/Hora" value={fmtDateTime(detail.created_at)} />
              <Field label="Ação" value={friendlyAction(detail.action)} />
              <Field label="Admin" value={detail.admin_name} />
              <Field label="Tipo de alvo" value={detail.target_type ?? '—'} />
              <Field label="ID do alvo" value={detail.target_id ?? '—'} mono />
              <Field label="Nome do alvo" value={detail.target_name ?? '—'} />
              <Field label="IP" value={detail.ip_address ?? '—'} mono />
              <Field label="User Agent" value={detail.user_agent ?? '—'} mono small />
              <div>
                <div style={lbl}>Metadata</div>
                <pre style={{
                  background: 'var(--color-bg-soft)', padding: 12, borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)', fontSize: 12, lineHeight: 1.5,
                  overflow: 'auto', maxHeight: 320, color: 'var(--color-text)',
                  fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {JSON.stringify(detail.metadata ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div>
      <div style={lbl}>{label}</div>
      <div style={{
        fontFamily: mono ? 'monospace' : 'var(--font-sans)',
        fontSize: small ? 11 : 13, fontWeight: 300, color: 'var(--color-text)',
        wordBreak: 'break-word',
      }}>{value}</div>
    </div>
  );
}
