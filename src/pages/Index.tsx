import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AthleteCard } from '@/components/AthleteCard';
import { mockAthletes, mockStats } from '@/lib/mock-data';
import { beltColor, beltTextColor } from '@/lib/utils';

export default function HomePage() {
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

  const athlete = mockAthletes[0];
  const achievements = [...athlete.achievements].reverse();

  const steps = [
    { num: '01', title: 'A escola cadastra seus atletas', desc: 'Nome completo, foto e dados únicos. O sistema garante que não há duplicatas.' },
    { num: '02', title: 'Registra a graduação e recebe os elementos', desc: 'Hash SHA-256 e QR Code de alta resolução, prontos para o certificado físico da academia.' },
    { num: '03', title: 'Qualquer pessoa verifica em segundos', desc: 'Escaneia o QR, cai na página pública do atleta. Imutável. Verificável. Para sempre.' },
  ];

  return (
    <div className="min-h-screen bg-main">
      <Navbar />

      {/* HERO */}
      <section className="min-h-screen flex items-center px-4 pt-24 pb-16 md:pt-20 md:pb-12 lg:pt-0 lg:pb-0">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="mb-6 md:mb-8">
              <span className="font-display text-[11px] md:text-[13px] uppercase tracking-[0.15em] text-ink-faint">
                ◆ Certificação Esportiva
              </span>
            </div>

            <h1 className="font-display font-extrabold text-[48px] sm:text-[64px] md:text-[96px] lg:text-[108px] text-ink mb-4 md:mb-6" style={{ lineHeight: '0.88' }}>
              O PASSAPORTE<br />
              <span className="italic">DEFINITIVO</span><br />
              DO SEU ATLETA.
            </h1>

            <div className="w-12 md:w-16 h-px mb-4 md:mb-6" style={{ backgroundColor: 'var(--color-accent)' }} />

            <p className="font-body text-base md:text-lg text-ink-muted max-w-[480px] mb-8 md:mb-12" style={{ lineHeight: '1.65' }}>
              Registre graduações. Gere autenticidade. Qualquer pessoa confirma a faixa do seu aluno escaneando um QR Code — para sempre.
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8 md:mb-12">
              <Link to="/#busca">
                <Button variant="hero" size="lg" className="hover:-translate-y-0.5 transition-transform duration-200 text-sm md:text-base">
                  Verificar um atleta
                </Button>
              </Link>
              <Link to="/cadastro" className="group font-body font-medium text-sm md:text-base text-ink inline-flex items-center gap-1 relative">
                <span className="relative">
                  Cadastrar minha escola
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-ink transition-all duration-300 group-hover:w-full" />
                </span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
              <div>
                <span className="font-body font-medium text-ink">{mockStats.totalAthletes.toLocaleString('pt-BR')}</span>
                <span className="font-body text-ink-faint ml-1">atletas</span>
              </div>
              <div className="w-px h-3 md:h-4" style={{ backgroundColor: 'var(--color-border)' }} />
              <div>
                <span className="font-body font-medium text-ink">{mockStats.totalSchools}</span>
                <span className="font-body text-ink-faint ml-1">escolas</span>
              </div>
              <div className="w-px h-3 md:h-4" style={{ backgroundColor: 'var(--color-border)' }} />
              <div>
                <span className="font-body font-medium text-ink">{mockStats.totalCertificates.toLocaleString('pt-BR')}</span>
                <span className="font-body text-ink-faint ml-1">certificados</span>
              </div>
            </div>
          </div>

          {/* 3D Card */}
          <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center" style={{ minHeight: '600px', perspective: '1200px' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 600px 600px at 50% 50%, rgba(200,241,53,0.06) 0%, transparent 70%)' }} />

            <div className="absolute" style={{ width: '380px', height: '520px', border: '1px solid var(--color-border)', borderRadius: '16px', transform: 'rotateY(8deg) rotateX(-4deg)', opacity: 0.4, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(212,208,200,0.3) 19px, rgba(212,208,200,0.3) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(212,208,200,0.3) 19px, rgba(212,208,200,0.3) 20px)' }} />

            <div className="relative z-10 bg-popover" style={{ width: '340px', border: '1px solid var(--color-border)', borderRadius: '16px', boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)', transform: 'rotateY(-6deg) rotateX(3deg)', padding: '24px' }}>
              <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-full w-fit" style={{ backgroundColor: 'var(--color-verified-bg)' }}>
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-verified)' }} />
                <span className="font-display font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--color-verified)' }}>Verificado</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>CM</div>
                <div>
                  <p className="font-display font-bold text-lg text-ink leading-tight">{athlete.name} {athlete.surname}</p>
                  <p className="font-body text-sm text-ink-muted">{athlete.school} · {athlete.sport}</p>
                </div>
              </div>
              <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="space-y-3 mb-4">
                {achievements.map(ach => (
                  <div key={ach.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: beltColor(ach.belt), border: ach.belt === 'Branca' ? '1px solid var(--color-border)' : undefined }} />
                    <span className="px-2 py-0.5 rounded-full text-xs font-body font-medium" style={{ backgroundColor: beltColor(ach.belt), color: beltTextColor(ach.belt), border: ach.belt === 'Branca' ? '1px solid var(--color-border)' : undefined }}>{ach.belt}</span>
                    <span className="font-body text-xs text-ink-faint">{new Date(ach.date + 'T00:00:00').getFullYear()}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="flex items-center justify-between">
                <span className="font-mono-hash text-[11px] text-ink-faint">{achievements[0]?.hashPartial}</span>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-40">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="28" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <rect x="32" y="8" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="4" y="28" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <rect x="8" y="32" width="8" height="8" rx="1" fill="currentColor" />
                  <rect x="28" y="28" width="4" height="4" fill="currentColor" />
                  <rect x="36" y="36" width="8" height="8" rx="1" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Floating mini-cards */}
            <div className="absolute z-20 bg-popover p-3 rounded-xl flex items-center gap-2" style={{ top: '8%', right: '2%', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', animation: 'heroFloat 3s ease-in-out infinite' }}>
              <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-verified)' }} />
              <span className="font-body text-[13px] text-ink-muted whitespace-nowrap">Verificado em 0,3s</span>
            </div>
            <div className="absolute z-20 bg-popover p-3 rounded-xl flex items-center gap-2" style={{ bottom: '12%', left: '0%', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', animation: 'heroFloat 3s ease-in-out infinite 1.5s' }}>
              <QrCode className="w-4 h-4 text-ink-muted" />
              <span className="font-body text-[13px] text-ink-muted whitespace-nowrap">QR Code gerado</span>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCA */}
      <section ref={buscaRef} id="busca" className="section-reveal py-16 md:py-24 px-4 relative">
        <div className="absolute top-0 left-0 right-0 h-10" style={{ background: 'linear-gradient(to bottom, var(--color-bg-surface), var(--color-bg))' }} />
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="font-display font-bold text-[36px] md:text-[56px] text-ink uppercase mb-2" style={{ lineHeight: '0.95' }}>
              Encontre um atleta
            </h2>
            <p className="font-body text-base md:text-lg text-ink-faint">certificado pela sua academia</p>
          </div>

          <div className="max-w-[720px] mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Nome do atleta, ID ou academia..."
                className="w-full h-14 md:h-16 pl-14 pr-5 rounded-xl bg-popover font-body text-sm md:text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all duration-200"
                style={{ border: '1.5px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06), 0 0 0 4px rgba(200,241,53,0.15)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.06)'; }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`filter-pill px-4 py-1.5 rounded-full text-[13px] font-body cursor-pointer ${activeFilter === f ? 'bg-ink text-popover font-medium filter-active' : 'hover:bg-surface'}`}
                style={activeFilter !== f ? { border: '1px solid var(--color-border)' } : {}}
              >{f}</button>
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

      {/* COMO FUNCIONA */}
      <section ref={comoRef} id="como-funciona" className="section-reveal py-16 md:py-28 lg:py-32 px-4 bg-surface">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-8 md:mb-10">
            <h2 className="font-display font-bold text-[32px] md:text-[48px] text-ink uppercase" style={{ lineHeight: '1' }}>Como funciona</h2>
            <p className="font-body text-base md:text-lg text-ink-muted mt-2 md:mt-0">Simples para a academia. Poderoso para a credibilidade.</p>
          </div>
          <div className="w-full h-px mb-8 md:mb-12" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.num}>
                {i > 0 && <div className="w-full h-px" style={{ backgroundColor: 'var(--color-border)' }} />}
                <div className="step-row flex items-start gap-4 md:gap-12 py-8 md:py-10">
                  <span className="step-num font-display font-extrabold text-[48px] md:text-[80px] leading-none shrink-0" style={{ color: 'rgba(200,241,53,0.6)' }}>{step.num}</span>
                  <div className="pt-3">
                    <h3 className="font-body font-medium text-base md:text-xl text-ink mb-2">{step.title}</h3>
                    <p className="font-body text-[13px] md:text-[15px] text-ink-muted max-w-lg" style={{ lineHeight: '1.6' }}>{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section ref={provaRef} className="section-reveal py-16 md:py-24 lg:py-28 px-4">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <h2 className="font-display font-extrabold text-[36px] md:text-[48px] lg:text-[64px] text-ink uppercase" style={{ lineHeight: '0.9' }}>
              MAIS DE {mockStats.totalAthletes.toLocaleString('pt-BR')} ATLETAS CERTIFICADOS.
            </h2>
          </div>
          <div className="lg:col-span-7">
            <div className="flex gap-8 md:gap-16 mb-8 md:mb-12">
              {[
                { value: mockStats.totalAthletes.toLocaleString('pt-BR'), label: 'Atletas' },
                { value: mockStats.totalSchools.toString(), label: 'Academias' },
                { value: mockStats.totalCertificates.toLocaleString('pt-BR'), label: 'Certificados' },
              ].map(m => (
                <div key={m.label} className="stat-block">
                  <span className="font-display font-bold text-[32px] md:text-[48px] text-ink block" style={{ lineHeight: '1' }}>{m.value}</span>
                  <span className="font-body text-sm text-ink-faint">{m.label}</span>
                </div>
              ))}
            </div>
            <div className="relative">
              <span className="font-display font-bold text-[100px] md:text-[120px] absolute -top-12 -left-4 select-none pointer-events-none" style={{ color: 'var(--color-bg-surface)', lineHeight: '1' }}>&ldquo;</span>
              <blockquote className="font-body italic text-base md:text-lg text-ink-muted pl-8" style={{ lineHeight: '1.65' }}>
                Agora qualquer árbitro ou federação consegue confirmar a faixa dos meus alunos na hora. Isso mudou a credibilidade da minha academia.
              </blockquote>
              <p className="font-body text-sm text-ink-faint mt-4 pl-8">— Prof. Luiz Felipe Villar, Faixa Preta 6° Grau</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section ref={ctaRef} className="section-reveal py-20 md:py-32 lg:py-36 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ctaGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ctaGrid)" />
          </svg>
        </div>
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="font-display font-extrabold text-[40px] md:text-[64px] lg:text-[96px] mb-4 md:mb-6" style={{ color: '#FFFFFF', lineHeight: '0.88' }}>
            SUA ACADEMIA<br />
            <span className="relative inline-block">
              MERECE ISSO.
              <span className="absolute left-0 w-full" style={{ height: '3px', backgroundColor: 'var(--color-accent)', bottom: '-4px' }} />
            </span>
          </h2>
          <p className="font-body text-lg mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>Cadastro gratuito. Você só paga quando graduar.</p>
          <Link to="/cadastro">
            <Button className="cta-glow font-body font-semibold text-base px-12 py-5 h-auto rounded-lg transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-ink)' }}>
              Cadastre sua escola
            </Button>
          </Link>
          <p className="mt-6 font-body text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Sem cartão de crédito · Sem contrato · Cancele quando quiser</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
