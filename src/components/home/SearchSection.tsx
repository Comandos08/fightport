import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BeltBadge } from '@/components/BeltBadge';
import { getInitials } from '@/lib/utils';

const PAGE_SIZE = 10;

export function SearchSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data: practitioners = [] } = useQuery({
    queryKey: ['public-practitioners'],
    queryFn: async () => {
      const { data } = await supabase
        .from('practitioners_public' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      return data ?? [];
    },
  });

  const filtered = practitioners.filter((a: any) => {
    const schoolName = a.school_name ?? '';
    return `${a.first_name} ${a.last_name} ${a.fp_id} ${schoolName}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getLastBelt = (achievements: any[]) => {
    if (!achievements || achievements.length === 0) return null;
    return achievements[achievements.length - 1]?.belt;
  };

  return (
    <section id="busca" style={{ background: 'var(--color-bg)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 20 }}>
              {t('search.badge')}
            </p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--color-text)', margin: '0 0 8px' }}>
              {t('search.title')}
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--color-text-muted)', fontWeight: 300 }}>
              {t('search.subtitle')}
            </p>
          </div>

          <div style={{ maxWidth: 720, margin: '0 auto 24px' }}>
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2" style={{ left: 20, width: 20, height: 20, color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder={t('search.placeholder')}
                style={{
                  width: '100%', height: 64, paddingLeft: 56, paddingRight: 20,
                  borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-soft)',
                  border: '1px solid var(--color-border)', fontFamily: 'var(--font-sans)',
                  fontSize: 15, color: 'var(--color-text)', outline: 'none', transition: 'var(--transition)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#9A9A9A'; e.currentTarget.style.background = '#FFFFFF'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; }}
              />
            </div>
          </div>

          {/* Results count */}
          {filtered.length > 0 && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              {t('search.found', { count: filtered.length })}
            </p>
          )}

          {/* Table */}
          {paginated.length > 0 ? (
            <>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{t('search.table.athlete')}</th>
                      <th className="hidden md:table-cell" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{t('search.table.id')}</th>
                      <th className="hidden sm:table-cell" style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{t('search.table.organization')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>{t('search.table.belt')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((a: any, idx: number) => {
                      const belt = getLastBelt(a.achievements);
                      const schoolName = (a.schools as any)?.name ?? '';
                      const isLast = idx === paginated.length - 1;
                      return (
                        <tr
                          key={a.id}
                          onClick={() => navigate(`/p/${a.fp_id}`)}
                          className="cursor-pointer"
                          style={{
                            borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                            transition: 'var(--transition)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div className="flex items-center" style={{ gap: 10 }}>
                              <div
                                style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: 'var(--color-text)', color: '#FFFFFF',
                                  fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11,
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(a.first_name, a.last_name)}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                                {a.first_name} {a.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell" style={{ padding: '12px 16px' }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'var(--color-text-muted)' }}>
                              {a.fp_id}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell" style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                              {schoolName}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            {belt ? <BeltBadge belt={belt} size="sm" /> : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <ExternalLink style={{ width: 14, height: 14, color: 'var(--color-text-muted)' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between" style={{ marginTop: 16, fontFamily: 'var(--font-sans)' }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {t('search.page', { current: currentPage, total: totalPages })}
                  </span>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage <= 1 ? 0.4 : 1,
                        transition: 'var(--transition)',
                      }}
                    >
                      <ChevronLeft style={{ width: 16, height: 16, color: 'var(--color-text)' }} />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage >= totalPages ? 0.4 : 1,
                        transition: 'var(--transition)',
                      }}
                    >
                      <ChevronRight style={{ width: 16, height: 16, color: 'var(--color-text)' }} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ margin: '64px auto', maxWidth: 400, textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 22, color: 'var(--color-text)', marginBottom: 8 }}>
                {t('search.emptyTitle')}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 24 }}>
                {t('search.emptyDesc')}
              </p>
              <a
                href="/cadastro"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: '#1C1C1C', background: 'var(--color-bg-amber)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', transition: 'var(--transition)', display: 'inline-block' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e09600')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-bg-amber)')}
              >
                {t('search.emptyCta')}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
