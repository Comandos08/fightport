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

  // Adapt to AthleteCard expected shape
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
    <section id="busca" className="py-24 px-4 relative">
      <div className="absolute top-0 left-0 right-0 h-10" style={{ background: 'linear-gradient(to bottom, var(--color-bg-surface), var(--color-bg))' }} />

      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-[48px] md:text-[56px] text-ink uppercase mb-2" style={{ lineHeight: '0.95' }}>
            Encontre um atleta
          </h2>
          <p className="font-body text-lg text-ink-faint">certificado pela sua academia</p>
        </div>

        <div className="max-w-[720px] mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Nome do atleta, ID ou academia..."
              className="w-full h-16 pl-14 pr-5 rounded-xl bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all duration-200"
              style={{
                border: '1.5px solid var(--color-border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06), 0 0 0 4px rgba(200,241,53,0.15)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)';
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-body transition-all duration-200 cursor-pointer ${
                activeFilter === f
                  ? 'bg-ink text-popover font-medium'
                  : 'hover:bg-surface'
              }`}
              style={activeFilter !== f ? { border: '1px solid var(--color-border)' } : {}}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mappedAthletes.map((a: any) => (
            <div key={a.id} className="animate-fade-in">
              <AthleteCard athlete={a} />
            </div>
          ))}
          {mappedAthletes.length === 0 && (
            <div className="col-span-full text-center py-20">
              <div className="font-display" style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>🎖</div>
              <p className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
                Nenhum atleta público cadastrado ainda.
              </p>
              <p className="font-body" style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
                Cadastre sua academia e emita o primeiro certificado.
              </p>
              <a
                href="/cadastro"
                className="font-display inline-flex items-center"
                style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: '#fff', background: 'var(--blue-deep)', padding: '12px 22px',
                  borderRadius: 'var(--radius-sm)', textDecoration: 'none', transition: 'var(--transition)',
                }}
              >
                Cadastrar minha academia →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
