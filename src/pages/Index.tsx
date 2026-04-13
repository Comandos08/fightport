import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes, mockStats } from '@/lib/mock-data';

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target, duration]);

  return { count, ref };
}

function FloatingCard() {
  const athlete = mockAthletes[0];
  const lastBelt = athlete.achievements[athlete.achievements.length - 1];
  return (
    <div
      className="rounded-xl border bg-main shadow-card p-5 w-72"
      style={{ transform: 'rotate(-3deg)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-verified" />
        <span className="text-xs font-body font-medium text-verified">Verificado</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
          CE
        </div>
        <div>
          <p className="font-display font-bold text-sm text-ink">{athlete.name}</p>
          <p className="font-body text-xs text-ink-muted">{athlete.school}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-body font-medium" style={{ backgroundColor: 'var(--belt-purple)', color: '#fff' }}>
          Faixa {lastBelt.belt}
        </span>
        <span className="font-mono-hash text-[10px] text-ink-faint">{lastBelt.hashPartial}</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const counterRef = useCountUp(mockStats.totalAthletes);

  const filters = ['Todos', 'Jiu-Jitsu', 'Judô', 'Faixa Azul', 'Faixa Preta'];

  const filtered = mockAthletes.filter(a => {
    const matchesSearch = `${a.name} ${a.surname}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Todos') return matchesSearch;
    if (activeFilter === 'Faixa Azul') return matchesSearch && a.achievements.some(ach => ach.belt === 'Azul');
    if (activeFilter === 'Faixa Preta') return matchesSearch && a.achievements.some(ach => ach.belt === 'Preta');
    return matchesSearch && a.sport === activeFilter;
  });

  return (
    <div className="min-h-screen bg-main">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="font-display font-extrabold text-6xl md:text-[88px] leading-[0.92] text-ink mb-6">
              O PASSAPORTE<br />DO SEU ATLETA.
            </h1>
            <p className="font-body text-lg text-ink-muted max-w-lg mb-8 leading-relaxed">
              Registre graduações. Gere autenticidade. Qualquer pessoa confirma a faixa do seu aluno escaneando um QR Code.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/#busca">
                <Button variant="hero" size="lg">Verificar um atleta</Button>
              </Link>
              <Link to="/cadastro">
                <Button variant="hero-ghost" size="lg">Cadastrar minha escola →</Button>
              </Link>
            </div>
            <div ref={counterRef.ref}>
              <span className="font-display font-bold text-5xl text-ink">
                {counterRef.count.toLocaleString('pt-BR')}
              </span>
              <span className="font-body text-lg text-ink-muted ml-2">atletas certificados</span>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="absolute inset-0 dot-pattern rounded-2xl" />
            <div className="relative z-10">
              <FloatingCard />
            </div>
          </div>
        </div>
      </section>

      {/* Busca */}
      <section id="busca" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink text-center mb-8 uppercase">
            Encontre um atleta certificado
          </h2>
          <div className="max-w-[680px] mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full h-14 pl-12 pr-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all"
                style={{ borderColor: 'var(--color-border)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-body transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'border text-ink-muted hover:text-ink hover:bg-surface'
                }`}
                style={activeFilter !== f ? { borderColor: 'var(--color-border)' } : {}}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => (
              <AthleteCard key={a.id} athlete={a} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="font-body text-ink-muted">Nenhum atleta encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ink text-center mb-14 uppercase">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'A escola cadastra', desc: 'seus atletas' },
              { num: '02', title: 'Registra a graduação', desc: 'e recebe hash única' },
              { num: '03', title: 'QR Code verificável', desc: 'para o mundo todo' },
            ].map(item => (
              <div key={item.num} className="rounded-xl border p-8" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-display font-bold text-6xl text-accent-brand block mb-4">{item.num}</span>
                <h3 className="font-body font-medium text-xl text-ink mb-1">{item.title}</h3>
                <p className="font-body text-ink-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="py-20 px-4 bg-surface">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {[
              { value: mockStats.totalAthletes.toLocaleString('pt-BR'), label: 'Atletas' },
              { value: mockStats.totalSchools.toString(), label: 'Escolas' },
              { value: mockStats.totalCertificates.toLocaleString('pt-BR'), label: 'Certificados' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <span className="font-display font-bold text-6xl md:text-7xl text-ink block">{s.value}</span>
                <span className="font-body text-lg text-ink-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 bg-dark">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4" style={{ color: '#FFFFFF' }}>
            SUA ACADEMIA MERECE ISSO.
          </h2>
          <p className="font-body text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Cadastro gratuito. Você só paga quando graduar.
          </p>
          <Link to="/cadastro">
            <Button variant="accent-lg">Cadastre sua escola</Button>
          </Link>
          <p className="mt-4 font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Sem cartão. Sem contrato. Cancele quando quiser.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
