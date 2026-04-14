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

      {/* HERO */}
      <HeroSection />

      {/* A — SOCIAL PROOF BAR */}
      <SocialProof />

      {/* B — O PROBLEMA */}
      <ProblemSection />

      {/* C — A SOLUÇÃO */}
      <SolutionSection />

      {/* D — COMO FUNCIONA */}
      <HowItWorks />

      {/* SEÇÃO BUSCA DE ATLETAS */}
      <section id="busca" style={{ backgroundColor: 'var(--bg)', padding: '100px 0' }}>
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="font-display font-bold text-[32px] text-ink uppercase text-center mb-10" style={{ lineHeight: '1', letterSpacing: '0.03em' }}>
            ENCONTRE UM ATLETA CERTIFICADO
          </h2>

          <div className="mx-auto mb-6" style={{ maxWidth: '680px' }}>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nome do atleta, ID ou academia..."
                className="w-full pl-14 pr-5 rounded-xl bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all duration-200"
                style={{ height: '56px', border: '1.5px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06), 0 0 0 4px rgba(200,241,53,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'; }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-body transition-all duration-200 cursor-pointer ${activeFilter === f ? 'font-medium' : 'hover:bg-surface'}`}
                style={
                  activeFilter === f
                    ? { backgroundColor: 'var(--color-ink)', color: '#FFFFFF' }
                    : { border: '1px solid var(--color-border)' }
                }
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
                <p className="font-body text-ink-muted">Nenhum atleta encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ backgroundColor: '#0D0D0D', padding: '120px 0' }}>
        <div className="container mx-auto max-w-3xl text-center px-4">
          <h2 className="font-display font-bold text-[36px] md:text-[56px] mb-6" style={{ color: '#FFFFFF', lineHeight: '1.05', letterSpacing: '-0.01em' }}>
            SUA ACADEMIA<br />MERECE ISSO.
          </h2>
          <p className="font-body text-lg mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cadastro gratuito. Você só paga quando graduar.
          </p>
          <Link to="/cadastro">
            <button
              className="font-body font-semibold text-base rounded-lg transition-all duration-200 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: '#C8F135', color: '#0D0D0D', padding: '16px 40px' }}
            >
              Começar agora — é grátis
            </button>
          </Link>
          <p className="mt-6 font-body text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Sem cartão · Sem contrato · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border-2)' }}>
        <div className="container mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="font-body text-[13px]" style={{ color: 'var(--cloud)' }}>
            fightport.pro · © 2026 fightport.pro · SportCombat
          </p>
        </div>
      </footer>
    </div>
  );
}
