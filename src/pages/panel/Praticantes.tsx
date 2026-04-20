import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Upload, Download, Eye, Award, Pencil, Trash2, ChevronLeft, ChevronRight, Filter, X, ChevronDown, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImportPraticantesModal } from '@/components/ImportPraticantesModal';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20;

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
  padding: '13px 16px', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)', outline: 'none', transition: 'var(--transition)',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#9A9A9A'; e.currentTarget.style.background = 'var(--color-bg)'; };
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; };

export default function PraticantesPage() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [beltFilter, setBeltFilter] = useState('');
  const [artFilter, setArtFilter] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: practitioners = [], isLoading } = useQuery({
    queryKey: ['practitioners', user?.id],
    queryFn: async () => { const { data } = await supabase.from('practitioners').select('*').eq('school_id', user!.id).order('first_name'); return data ?? []; },
    enabled: !!user,
  });

  const { data: school } = useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => { const { data } = await supabase.from('schools').select('name, martial_art').eq('id', user!.id).single(); return data; },
    enabled: !!user,
  });

  const belts = [...new Set(practitioners.map(p => p.current_belt).filter(Boolean))] as string[];
  const arts = [...new Set(practitioners.map(p => p.martial_art).filter(Boolean))] as string[];

  const filtered = practitioners.filter(a => {
    const matchesSearch = `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesBelt = !beltFilter || a.current_belt === beltFilter;
    const matchesArt = !artFilter || a.martial_art === artFilter;
    return matchesSearch && matchesBelt && matchesArt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleFilterChange = (setter: (v: string) => void) => (value: string) => { setter(value); setPage(1); };
  const hasActiveFilters = !!beltFilter || !!artFilter;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('practitioners').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      toast.error(error.message.includes('foreign') ? t('practitioners.deleteForeignKey') : error.message);
    } else {
      toast.success(t('practitioners.deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      queryClient.invalidateQueries({ queryKey: ['practitioner-count'] });
    }
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) { toast.error(t('practitioners.noneForExport')); return; }
    const headers = [t('practitioners.table.name'), t('edit.lastName'), t('practitioners.table.martialArt'), t('practitioners.table.lastBelt'), 'FP ID', t('edit.dob'), t('edit.sex')];
    const rows = filtered.map(a => [a.first_name, a.last_name, a.martial_art, a.current_belt ?? '', a.fp_id, a.birth_date ?? '', a.gender ?? '']);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `praticantes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t('practitioners.exported', { count: filtered.length }));
  };

  const tableHeaders = [t('practitioners.table.name'), t('practitioners.table.martialArt'), t('practitioners.table.lastBelt'), t('practitioners.table.school'), ''];

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between" style={{ gap: 16, marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 28, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>{t('practitioners.title')}</h1>
        <div className="flex" style={{ gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={handleExportCsv}><Download className="h-4 w-4" /> {t('practitioners.exportCsv')}</Button>
          <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" /> {t('practitioners.importCsv')}</Button>
          <Link to="/painel/praticantes/novo">
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5A623', color: '#1C1C1C', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e09600')} onMouseLeave={e => (e.currentTarget.style.background = '#F5A623')}>
              <Plus className="h-4 w-4" /> {t('practitioners.newPractitioner')}
            </button>
          </Link>
        </div>
      </div>

      <div className="relative" style={{ marginBottom: 20 }}>
        <Search className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, width: 16, height: 16, color: 'var(--color-text-muted)' }} />
        <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)} placeholder={t('practitioners.searchPlaceholder')} style={{ ...inputStyle, width: '100%', height: 44, paddingLeft: 40 }} onFocus={focusInput} onBlur={blurInput} />
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: 12, marginBottom: 20 }}>
        <Filter style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
        <select value={beltFilter} onChange={e => handleFilterChange(setBeltFilter)(e.target.value)} style={{ ...inputStyle, height: 36, padding: '0 12px', fontSize: 13 }} onFocus={focusInput as any} onBlur={blurInput as any}>
          <option value="">{t('practitioners.allBelts')}</option>
          {belts.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        {arts.length > 1 && (
          <select value={artFilter} onChange={e => handleFilterChange(setArtFilter)(e.target.value)} style={{ ...inputStyle, height: 36, padding: '0 12px', fontSize: 13 }} onFocus={focusInput as any} onBlur={blurInput as any}>
            <option value="">{t('practitioners.allArts')}</option>
            {arts.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setBeltFilter(''); setArtFilter(''); setPage(1); }}>
            <X className="h-3 w-3" /> {t('practitioners.clearFilters')}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}><div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--color-text)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Search style={{ width: 24, height: 24, color: 'var(--color-text-muted)' }} /></div>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', marginBottom: 4 }}>{t('practitioners.emptyTitle')}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('practitioners.emptyDesc')}</p>
          <Link to="/painel/praticantes/novo"><Button>{t('practitioners.newPractitioner')}</Button></Link>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'auto' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-soft)' }}>
                  {tableHeaders.map((h, i) => (
                    <th key={i} style={{ textAlign: i === 4 ? 'right' : 'left', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i !== paginatedItems.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'var(--transition)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center" style={{ gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-text)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, flexShrink: 0 }}>{getInitials(a.first_name, a.last_name)}</div>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, color: 'var(--color-text)' }}>{a.first_name} {a.last_name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{a.martial_art}</td>
                    <td style={{ padding: '14px 16px' }}>{a.current_belt ? <BeltBadge belt={a.current_belt as any} size="sm" /> : <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>}</td>
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)' }}>{school?.name ?? '...'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div className="flex items-center justify-end" style={{ gap: 8 }}>
                        {[
                          { to: `/p/${a.fp_id}`, icon: Eye, label: t('practitioners.viewPassport') },
                          { to: '/painel/conquistas/nova', icon: Award, label: t('practitioners.registerAchievement') },
                          { to: `/painel/praticantes/${a.id}/editar`, icon: Pencil, label: t('practitioners.edit') },
                        ].map(act => (
                          <Link key={act.label} to={act.to}>
                            <button className="cursor-pointer" aria-label={act.label} style={{ background: 'none', border: 'none', padding: 4, color: 'var(--color-text-muted)', transition: 'var(--transition)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                              <act.icon style={{ width: 16, height: 16 }} />
                            </button>
                          </Link>
                        ))}
                        <button className="cursor-pointer" aria-label={t('practitioners.delete')} onClick={() => setDeleteTarget({ id: a.id, name: `${a.first_name} ${a.last_name}` })}
                          style={{ background: 'none', border: 'none', padding: 4, color: 'var(--color-text-muted)', transition: 'var(--transition)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: 16 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
              {t('practitioners.count', { count: filtered.length, page: currentPage, total: totalPages })}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center" style={{ gap: 4 }}>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => { if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis'); acc.push(p); return acc; }, [])
                  .map((item, idx) => item === 'ellipsis' ? <span key={`e-${idx}`} style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', padding: '0 4px' }}>…</span> : <Button key={item} variant={item === currentPage ? 'default' : 'ghost'} size="icon" className="h-8 w-8 text-sm" onClick={() => setPage(item)}>{item}</Button>)}
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,25,35,0.5)', padding: 16 }} onClick={() => setDeleteTarget(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>{t('practitioners.deleteTitle')}</h3>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: t('practitioners.deleteConfirm', { name: deleteTarget.name }) }} />
            <div className="flex justify-end" style={{ gap: 12 }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>{t('practitioners.cancel')}</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? t('practitioners.deleting') : t('practitioners.delete')}</Button>
            </div>
          </div>
        </div>
      )}

      <ImportPraticantesModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
