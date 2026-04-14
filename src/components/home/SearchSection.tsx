import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes } from '@/lib/mock-data';

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Jiu-Jitsu', 'Judô', 'Karatê', 'Muay Thai', 'Faixa Preta', 'Faixa Roxa'];

  const filtered = mockAthletes.filter(a => {
    const matchesSearch = `${a.name} ${a.surname} ${a.school}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Todos') return matchesSearch;
    if (activeFilter === 'Faixa Preta') return matchesSearch && a.achievements.some(ach => ach.belt === 'Preta');
    if (activeFilter === 'Faixa Roxa') return matchesSearch && a.achievements.some(ach => ach.belt === 'Roxa');
    return matchesSearch && a.sport === activeFilter;
  });

  return (
    <section id="busca" className="py-24 px-4 relative">
      {/* Top gradient separator */}
      <div className="absolute top-0 left-0 right-0 h-10" style={{ background: 'linear-gradient(to bottom, var(--color-bg-surface), var(--color-bg))' }} />

      <div className="container mx-auto max-w-7xl">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-[48px] md:text-[56px] text-ink uppercase mb-2" style={{ lineHeight: '0.95' }}>
            Encontre um atleta
          </h2>
          <p className="font-body text-lg text-ink-faint">certificado pela sua academia</p>
        </div>

        {/* Search input */}
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

        {/* Filter pills */}
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

        {/* Athlete grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <AthleteCard athlete={a} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="font-body text-ink-muted">Nenhum atleta encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
