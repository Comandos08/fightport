import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Download, Copy, Building2, User, Award } from 'lucide-react';
import { DashTable } from '@/components/dash/DashTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ipt: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300,
  padding: '8px 10px', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
  color: 'var(--color-text)', width: '100%',
};
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  color: 'var(--color-text-muted)', marginBottom: 4, display: 'block',
};

const shortHash = (h?: string | null) => {
  if (!h) return '—';
  if (h.length <= 18) return h;
  return `${h.slice(0, 8)}…${h.slice(-8)}`;
};

export default function Graduacoes() {
  const [search, setSearch] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [martialArt, setMartialArt] = useState('');
  const [belt, setBelt] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const limit = 50;

  const filters = useMemo(() => ({
    p_search: search || null,
    p_school_id: schoolId || null,
    p_martial_art: martialArt || null,
    p_belt: belt || null,
    p_date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
    p_date_to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : null,
    p_limit: limit,
    p_offset: page * limit,
  }), [search, schoolId, martialArt, belt, dateFrom, dateTo, page]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin-list-achievements', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_achievements', filters as any);
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

  const clearFilters = () => {
    setSearch(''); setSchoolId(''); setMartialArt(''); setBelt('');
    setDateFrom(''); setDateTo(''); setPage(0);
  };

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast({ title: 'Hash copiado', description: hash });
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  const exportCsv = async () => {
    const { data } = await supabase.rpc('admin_list_achievements', { ...filters, p_limit: 10000, p_offset: 0 } as any);
    const all = (data ?? []) as any[];
    const header = ['Data/hora', 'Data graduação', 'Atleta', 'FP-ID', 'Escola', 'Arte marcial', 'Faixa', 'Grau', 'Graduado por', 'Hash'];
    const lines = [header.join(',')];
    for (const r of all) {
      const cells = [
        format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss'),
        r.graduation_date,
        r.practitioner_name ?? '',
        r.fp_id ?? '',
        r.school_name ?? '',
        r.martial_art ?? '',
        r.belt,
        r.degree ?? '',
        r.graduated_by,
        r.hash,
      ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`);
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graduacoes-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 28, fontWeight: 600, letterSpacing: '0.02em', margin: 0, color: 'var(--color-text)' }}>
            Graduações
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Histórico global de todas as graduações registradas (somente leitura — imutáveis).
          </p>
        </div>
        <button onClick={exportCsv} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
          color: 'var(--color-text)', cursor: 'pointer',
        }}>
          <Download style={{ width: 14, height: 14 }} /> Exportar CSV
        </button>
      </div>

      {/* Filtros — padrão Auditoria */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
        background: 'var(--color-bg-soft)', padding: 16, borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)', marginBottom: 20,
      }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={lbl}>Buscar</label>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--color-text-muted)' }} />
            <input
              style={{ ...ipt, paddingLeft: 32 }}
              placeholder="Nome do atleta, FP-ID ou hash…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
        </div>

        <div>
          <label style={lbl}>Escola</label>
          <select style={ipt} value={schoolId} onChange={e => { setSchoolId(e.target.value); setPage(0); }}>
            <option value="">Todas</option>
            {(schools as any[]).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={lbl}>Arte marcial</label>
          <select style={ipt} value={martialArt} onChange={e => { setMartialArt(e.target.value); setPage(0); }}>
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
          <input style={ipt} placeholder="Ex: Azul" value={belt} onChange={e => { setBelt(e.target.value); setPage(0); }} />
        </div>

        <div>
          <label style={lbl}>De</label>
          <input type="date" style={ipt} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }} />
        </div>

        <div>
          <label style={lbl}>Até</label>
          <input type="date" style={ipt} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={clearFilters} style={{
            padding: '9px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)',
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
            color: 'var(--color-text-muted)', cursor: 'pointer', width: '100%',
          }}>Limpar</button>
        </div>
      </div>

      {/* Tabela */}
      <DashTable
        headers={['Data/hora', 'Atleta', 'Escola', 'Arte marcial', 'Faixa', 'Graduado por', 'Hash']}
        isLoading={isLoading}
        isEmpty={!isLoading && rows.length === 0}
        emptyIcon={Award}
        emptyTitle="Nenhuma graduação encontrada"
        emptyDescription="Ajuste os filtros para ver mais resultados."
        pagination={{ page, totalPages, total, limit, onPageChange: setPage }}
      >
        {(rows as any[]).map(r => (
          <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {format(new Date(r.created_at), 'dd/MM/yyyy HH:mm')}
            </td>
            <td style={{ padding: '6px 12px' }}>
              {r.practitioner_id ? (
                <Link to={`/dash/atletas/${r.practitioner_id}`} style={{ color: 'var(--color-text)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <User style={{ width: 12, height: 12 }} />
                  {r.practitioner_name}
                </Link>
              ) : '—'}
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{r.fp_id}</div>
            </td>
            <td style={{ padding: '6px 12px' }}>
              {r.school_id ? (
                <Link to={`/dash/organizacoes/${r.school_id}`} style={{ color: 'var(--color-text)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Building2 style={{ width: 12, height: 12 }} />
                  {r.school_name}
                </Link>
              ) : '—'}
            </td>
            <td style={{ padding: '6px 12px', color: 'var(--color-text-muted)' }}>{r.martial_art ?? '—'}</td>
            <td style={{ padding: '6px 12px', color: 'var(--color-text)' }}>
              {r.belt}{r.degree ? ` · ${r.degree}°` : ''}
            </td>
            <td style={{ padding: '6px 12px', color: 'var(--color-text)' }}>{r.graduated_by}</td>
            <td style={{ padding: '6px 12px' }}>
              <button
                onClick={() => copyHash(r.hash)}
                title="Clique para copiar o hash completo"
                style={{
                  background: 'transparent', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm, 6px)', padding: '4px 8px', cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)', fontSize: 11,
                  color: 'var(--color-text)', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                {shortHash(r.hash)} <Copy style={{ width: 11, height: 11 }} />
              </button>
            </td>
          </tr>
        ))}
      </DashTable>
    </div>
  );
}
