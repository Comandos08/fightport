import { useState } from 'react';
import { Search } from 'lucide-react';
import { AthleteCard } from '@/components/AthleteCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Jiu-Jitsu', 'Judô', 'Karatê', 'Muay Thai', 'Faixa Preta', 'Faixa Roxa'];

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
    const matchesSearch = `${a.first_name} ${a.last_name} ${schoolName}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Todos') return matchesSearch;
    if (activeFilter === 'Faixa Preta') return matchesSearch && a.achievements?.some((ach: any) => ach.belt === 'Preta');
    if (activeFilter === 'Faixa Roxa') return matchesSearch && a.achievements?.some((ach: any) => ach.belt === 'Roxa');
    return matchesSearch && a.martial_art === activeFilter;
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
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 20 }}>
              BUSCA PÚBLICA
            </p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)', margin: '0 0 8px' }}>
              Encontre um atleta
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--color-text-muted)' }}>
              certificado pela sua academia
            </p>
          </div>

          <div style={{ maxWidth: 720, margin: '0 auto 24px' }}>
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2" style={{ left: 20, width: 20, height: 20, color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nome do atleta, ID ou academia..."
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

          <div className="flex flex-wrap justify-center" style={{ gap: 8, marginBottom: 48 }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="cursor-pointer"
                style={{
                  padding: '6px 16px', borderRadius: 100,
                  fontFamily: 'var(--font-sans)', fontSize: 13,
                  fontWeight: activeFilter === f ? 500 : 400,
                  background: activeFilter === f ? 'var(--color-text)' : 'transparent',
                  color: activeFilter === f ? '#FFFFFF' : 'var(--color-text-muted)',
                  border: activeFilter === f ? 'none' : '1px solid var(--color-border)',
                  transition: 'var(--transition)',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
            {mappedAthletes.map((a: any) => (
              <div key={a.id}>
                <AthleteCard athlete={a} />
              </div>
            ))}
            {mappedAthletes.length === 0 && (
              <div className="col-span-full" style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, color: 'var(--color-text)', marginBottom: 8 }}>
                  Nenhum atleta público cadastrado ainda.
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>
                  Cadastre sua academia e emita o primeiro certificado.
                </p>
                <a href="/cadastro" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: '#1C1C1C', background: 'var(--color-bg-amber)', padding: '12px 24px', borderRadius: 'var(--radius-sm)', textDecoration: 'none', transition: 'var(--transition)', display: 'inline-block' }}>
                  Cadastrar minha academia →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
