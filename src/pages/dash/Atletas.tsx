import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { maskCpf } from '@/lib/sensitive';

type SortKey = 'name' | 'fp_id' | 'belt' | 'achievements' | 'created_at';

const ipt: React.CSSProperties = {
  height: 32, padding: '0 10px', fontFamily: 'var(--font-sans)', fontSize: 13,
  background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm, 6px)', outline: 'none',
};
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block',
};

export default function Atletas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [martialArt, setMartialArt] = useState('');
  const [belt, setBelt] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SortKey>('created_at');
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const limit = 50;

  const filters = useMemo(() => ({
    p_search: search || null,
    p_school_id: schoolId || null,
    p_martial_art: martialArt || null,
    p_belt: belt || null,
    p_date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
    p_date_to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : null,
    p_sort: sort,
    p_dir: dir,
    p_limit: limit,
    p_offset: page * limit,
  }), [search, schoolId, martialArt, belt, dateFrom, dateTo, sort, dir, page]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-list-practitioners', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_practitioners', filters as any);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['admin-list-schools-min'],
    queryFn: async () => {
      const { data } = await supabase.rpc('admin_list_schools', {
        p_limit: 1000, p_offset: 0, p_sort: 'name', p_dir: 'asc',
      } as any);
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

  const sortIcon = (k: SortKey) => sort !== k ? null :
    dir === 'asc' ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />;

  const clearFilters = () => {
    setSearch(''); setSchoolId(''); setMartialArt(''); setBelt('');
    setDateFrom(''); setDateTo(''); setPage(0);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 28, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
          Atletas
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          Visão global de todos os praticantes cadastrados na plataforma.
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)', padding: 16,
        display: 'grid', gap: 12,
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted)' }} />
            <input
              style={{ ...ipt, width: '100%', paddingLeft: 32 }}
              placeholder="Nome, FP-ID ou CPF…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        <div>
          <label style={lbl}>Escola</label>
          <select style={{ ...ipt, width: '100%' }} value={schoolId} onChange={e => { setSchoolId(e.target.value); setPage(0); }}>
            <option value="">Todas</option>
            {(schools as any[]).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={lbl}>Arte marcial</label>
          <select style={{ ...ipt, width: '100%' }} value={martialArt} onChange={e => { setMartialArt(e.target.value); setPage(0); }}>
            <option value="">Todas</option>
            <option value="Jiu-Jitsu">Jiu-Jitsu</option>
            <option value="Judô">Judô</option>
            <option value="Karatê">Karatê</option>
            <option value="Taekwondo">Taekwondo</option>
            <option value="Muay Thai">Muay Thai</option>
            <option value="Boxe">Boxe</option>
          </select>
        </div>

        <div>
          <label style={lbl}>Faixa</label>
          <input style={{ ...ipt, width: '100%' }} placeholder="Ex: Azul" value={belt} onChange={e => { setBelt(e.target.value); setPage(0); }} />
        </div>

        <div>
          <label style={lbl}>De</label>
          <input type="date" style={{ ...ipt, width: '100%' }} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} />
        </div>

        <div>
          <label style={lbl}>Até</label>
          <input type="date" style={{ ...ipt, width: '100%' }} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={clearFilters} style={{
            ...ipt, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent',
          }}>
            <X style={{ width: 12, height: 12 }} /> Limpar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div style={{
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)' }}>
                {([
                  ['name', 'Nome'], ['fp_id', 'FP-ID'], [null, 'CPF'], [null, 'Escola'],
                  [null, 'Arte'], ['belt', 'Faixa'], ['achievements', 'Graduações'], ['created_at', 'Cadastro'],
                ] as [SortKey | null, string][]).map(([k, label]) => (
                  <th key={label} onClick={() => k && toggleSort(k)} style={{
                    textAlign: 'left', padding: '8px 12px', fontWeight: 500, fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    color: 'var(--color-text-muted)', cursor: k ? 'pointer' : 'default',
                    userSelect: 'none', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {label} {k && sortIcon(k)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Carregando…</td></tr>
              )}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>Nenhum atleta encontrado.</td></tr>
              )}
              {(rows as any[]).map(r => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/dash/atletas/${r.id}`)}
                  style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '8px 12px', color: 'var(--color-text)' }}>{r.first_name} {r.last_name}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{r.fp_id}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono, monospace)', fontSize: 12 }}>{maskCpf(r.cpf)}</td>
                  <td style={{ padding: '8px 12px' }} onClick={e => e.stopPropagation()}>
                    {r.school_id ? (
                      <Link to={`/dash/organizacoes/${r.school_id}`} style={{ color: 'var(--color-text)', textDecoration: 'underline' }}>
                        {r.school_name}
                      </Link>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>{r.martial_art}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text)' }}>{r.current_belt ?? '—'}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text)' }}>{r.achievements_count}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)' }}>{format(new Date(r.created_at), 'dd/MM/yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div style={{
          padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)', fontFamily: 'var(--font-sans)', fontSize: 12,
          color: 'var(--color-text-muted)',
        }}>
          <span>Total: {total} atleta{total === 1 ? '' : 's'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ ...ipt, padding: '0 8px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1 }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page + 1 >= totalPages}
              style={{ ...ipt, padding: '0 8px', cursor: page + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: page + 1 >= totalPages ? 0.4 : 1 }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
