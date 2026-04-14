import { useState } from 'react';
import { Search } from 'lucide-react';
import { AthleteCard } from '@/components/AthleteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export function SearchSection() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: practitioners = [] } = useQuery({
    queryKey: ['public-practitioners'],
    queryFn: async () => {
      const { data } = await supabase
        .from('practitioners')
        .select('*, schools(name), achievements(belt)')
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const filtered = practitioners.filter((a: any) => {
    const schoolName = (a.schools as any)?.name ?? '';
    return `${a.first_name} ${a.last_name} ${a.fp_id} ${schoolName}`.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const mappedAthletes = filtered.map((a: any) => ({
    id: a.id,
    publicId: a.fp_id,
    name: a.first_name,
    surname: a.last_name,
    sport: a.martial_art,
    school: (a.schools as any)?.name ?? '',
    headCoach: '',
    headCoachBelt: '',
    photo: a.photo_url,
    achievements: (a.achievements ?? []).map((ach: any, idx: number) => ({
      id: `${a.id}-${idx}`,
      date: '',
      belt: ach.belt,
      title: `Faixa ${ach.belt}`,
      hashPartial: '',
      hashFull: '',
      school: '',
      graduatedBy: '',
    })),
  }));

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
                onChange={e => setSearchQuery(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
            {mappedAthletes.map((a: any) => (
              <div key={a.id}>
                <AthleteCard athlete={a} />
              </div>
            ))}
           {mappedAthletes.length === 0 && (
              <div className="col-span-full" style={{ margin: '64px auto', maxWidth: 400, textAlign: 'center' }}>
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
      </div>
    </section>
  );
}
