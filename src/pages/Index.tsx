import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes, mockStats } from '@/lib/mock-data';
import { HeroSection } from '@/components/home/HeroSection';
import { SocialProof } from '@/components/home/SocialProof';
import { ProblemSection } from '@/components/home/ProblemSection';
import { SolutionSection } from '@/components/home/SolutionSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PricingSection } from '@/components/home/PricingSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CtaSection } from '@/components/home/CtaSection';
import { FooterSection } from '@/components/home/FooterSection';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Jiu-Jitsu', 'Judô', 'Faixa Azul', 'Faixa Preta'];

  const filtered = mockAthletes.filter(a => {
    const matchesSearch = `${a.name} ${a.surname} ${a.school}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Todos') return matchesSearch;
    if (activeFilter === 'Faixa Preta') return matchesSearch && a.achievements.some(ach => ach.belt === 'Preta');
    if (activeFilter === 'Faixa Azul') return matchesSearch && a.achievements.some(ach => ach.belt === 'Azul');
    return matchesSearch && a.sport === activeFilter;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <HeroSection />
      <SocialProof />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />

      {/* SEÇÃO BUSCA DE ATLETAS */}
      <section id="busca" style={{ backgroundColor: 'var(--bg)', padding: '100px 0', borderTop: '1px solid var(--border-2)' }}>
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="font-display font-bold text-[32px] uppercase text-center mb-10" style={{ lineHeight: '1', letterSpacing: '0.03em', color: 'var(--ink)' }}>
            ENCONTRE UM ATLETA CERTIFICADO
          </h2>

          <div className="mx-auto mb-6" style={{ maxWidth: '680px' }}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--cloud)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nome do atleta, ID ou academia..."
                className="w-full pl-14 pr-5 rounded-xl font-body text-base focus:outline-none transition-all duration-200"
                style={{ height: '56px', border: '1.5px solid var(--border-2)', boxShadow: 'var(--shadow-card)', background: 'var(--white)', color: 'var(--ink)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--blue-deep)'; e.currentTarget.style.boxShadow = 'var(--shadow-card), 0 0 0 4px rgba(19,76,115,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-body transition-all duration-200 cursor-pointer ${activeFilter === f ? 'font-medium' : ''}`}
                style={
                  activeFilter === f
                    ? { backgroundColor: 'var(--blue-deep)', color: '#FFFFFF' }
                    : { border: '1px solid var(--border-2)', color: 'var(--muted)' }
                }
                onMouseEnter={(e) => { if (activeFilter !== f) e.currentTarget.style.background = 'var(--bg-2)'; }}
                onMouseLeave={(e) => { if (activeFilter !== f) e.currentTarget.style.background = 'transparent'; }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(a => (
              <AthleteCard key={a.id} athlete={a} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16">
                <p className="font-body" style={{ color: 'var(--muted)' }}>Nenhum atleta encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}
