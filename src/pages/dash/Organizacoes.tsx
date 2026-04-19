import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type SortKey = 'name' | 'email' | 'city' | 'martial_art' | 'created_at' | 'balance' | 'total_spent';

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
const ipt: React.CSSProperties = {
  height: 32, padding: '0 10px', fontFamily: 'var(--font-sans)', fontSize: 13,
  background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm, 6px)', outline: 'none',
};
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block',
};

export default function Organizacoes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [martialArt, setMartialArt] = useState('');
  const [stateF, setStateF] = useState('');
  const [status, setStatus] = useState('');
  const [credits, setCredits] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortKey>('created_at');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const limit = 50;

  const filters = useMemo(() => ({
    p_search: search || null,
    p_martial_art: martialArt || null,
    p_state: stateF || null,
    p_status: status || null,
    p_credits: credits || null,
    p_date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
    p_date_to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : null,
    p_sort: sort,
    p_dir: dir,
    p_limit: limit,
    p_offset: page * limit,
  }), [search, martialArt, stateF, status, credits, dateFrom, dateTo, sort, dir, page]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-list-schools', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_schools', filters);
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleSort = (k: SortKey) => {
    if (sort === k) setDir(dir === 'asc' ? 'desc' : 'asc');
    else { setSort(k); setDir('asc'); }
    setPage(0);
  };

  const exportCsv = async () => {
    const { data } = await supabase.rpc('admin_list_schools', { ...filters, p_limit: 10000, p_offset: 0 });
    const all = data ?? [];
    const header = ['Nome', 'Responsável', 'Email', 'Cidade', 'UF', 'Arte', 'Cadastro', 'Saldo', 'Total gasto (R$)', 'Status'];
    const lines = [header.join(',')];
    for (const r of all as any[]) {
      const cells = [
        r.name, r.head_coach ?? '', r.email, r.city ?? '', r.state ?? '', r.martial_art,
        format(new Date(r.created_at), 'yyyy-MM-dd'),
        r.balance, Number(r.total_spent || 0).toFixed(2),
        r.is_suspended ? 'Suspensa' : 'Ativa',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `organizacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ k }: { k: SortKey }) => sort !== k ? null : (dir === 'asc' ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />);

  const headerCell = (k: SortKey, label: string, align: 'left' | 'right' = 'left') => (
    <th
      onClick={() => toggleSort(k)}
      style={{
        textAlign: align, padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: 11,
        fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em',
        color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none',
        borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="inline-flex items-center" style={{ gap: 4 }}>{label}<SortIcon k={k} /></span>
    </th>
  );

  const td: React.CSSProperties = {
    padding: '12px', fontFamily: 'var(--font-sans)', fontSize: 13,
    color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', whiteSpace: 'nowrap',
  };

  const clearFilters = () => {
    setSearch(''); setMartialArt(''); setStateF(''); setStatus(''); setCredits(''); setDateFrom(''); setDateTo(''); setPage(0);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto' }}>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', color: 'var(--color-text)' }}>Organizações</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--color-text-muted)', marginTop: 4 }}>
            {total} {total === 1 ? 'organização cadastrada' : 'organizações cadastradas'}
          </p>
        </div>
        <button
          onClick={exportCsv}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            color: 'var(--color-text)', cursor: 'pointer',
          }}
        >
          <Download style={{ width: 14, height: 14 }} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12,
          background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md, 8px)', padding: 16, marginBottom: 20,
        }}
      >
        <div style={{ gridColumn: 'span 2' }}>
          <label style={lbl}>Busca</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Nome, email ou cidade"
              style={{ ...ipt, width: '100%', paddingLeft: 32 }}
            />
          </div>
        </div>
        <div>
          <label style={lbl}>Arte marcial</label>
          <select value={martialArt} onChange={e => { setMartialArt(e.target.value); setPage(0); }} style={{ ...ipt, width: '100%' }}>
            <option value="">Todas</option>
            <option value="Jiu-Jitsu">Jiu-Jitsu</option>
            <option value="Judô">Judô</option>
            <option value="Karatê">Karatê</option>
            <option value="Taekwondo">Taekwondo</option>
            <option value="Muay Thai">Muay Thai</option>
            <option value="Boxe">Boxe</option>
            <option value="MMA">MMA</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Estado</label>
          <input value={stateF} onChange={e => { setStateF(e.target.value.toUpperCase()); setPage(0); }} placeholder="UF" maxLength={2} style={{ ...ipt, width: '100%' }} />
        </div>
        <div>
          <label style={lbl}>Status</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} style={{ ...ipt, width: '100%' }}>
            <option value="">Todos</option>
            <option value="active">Ativas</option>
            <option value="suspended">Suspensas</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Créditos</label>
          <select value={credits} onChange={e => { setCredits(e.target.value); setPage(0); }} style={{ ...ipt, width: '100%' }}>
            <option value="">Todos</option>
            <option value="with">Com créditos</option>
            <option value="without">Sem créditos</option>
          </select>
        </div>
        <div>
          <label style={lbl}>Cadastro de</label>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} style={{ ...ipt, width: '100%' }} />
        </div>
        <div>
          <label style={lbl}>Cadastro até</label>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} style={{ ...ipt, width: '100%' }} />
        </div>
        <div className="flex items-end">
          <button onClick={clearFilters} style={{
            padding: '9px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            color: 'var(--color-text-muted)', cursor: 'pointer', width: '100%',
          }}>Limpar</button>
        </div>
      </div>

      {/* Tabela */}
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {headerCell('name', 'Nome')}
                <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>Responsável</th>
                {headerCell('email', 'Email')}
                {headerCell('city', 'Cidade/UF')}
                {headerCell('martial_art', 'Arte')}
                {headerCell('created_at', 'Cadastro')}
                {headerCell('balance', 'Saldo', 'right')}
                {headerCell('total_spent', 'Total gasto', 'right')}
                <th style={{ textAlign: 'left', padding: '10px 12px', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-soft)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>Carregando...</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>Nenhuma organização encontrada</td></tr>
              )}
              {rows.map((r: any) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/dash/organizacoes/${r.id}`)}
                  style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ ...td, fontWeight: 500 }}>{r.name}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{r.head_coach ?? '—'}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{r.email}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{[r.city, r.state].filter(Boolean).join(' / ') || '—'}</td>
                  <td style={td}>{r.martial_art}</td>
                  <td style={{ ...td, color: 'var(--color-text-muted)' }}>{format(new Date(r.created_at), 'dd/MM/yyyy')}</td>
                  <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{r.balance}</td>
                  <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtBRL(r.total_spent)}</td>
                  <td style={td}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', fontSize: 11, fontWeight: 500,
                      borderRadius: 4,
                      color: r.is_suspended ? '#dc2626' : '#16a34a',
                      background: r.is_suspended ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)',
                    }}>
                      {r.is_suspended ? 'Suspensa' : 'Ativa'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>
          Página {page + 1} de {totalPages} · {total} {total === 1 ? 'resultado' : 'resultados'}
        </span>
        <div className="flex items-center" style={{ gap: 8 }}>
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            style={{ height: 30, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}>
            <ChevronLeft style={{ width: 14, height: 14 }} /> Anterior
          </button>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            style={{ height: 30, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page >= totalPages - 1 ? 0.5 : 1 }}>
            Próxima <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
