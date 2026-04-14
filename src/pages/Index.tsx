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

  const filters = ['Todos', 'Jiu-Jitsu', 'Judô', 'Faixa Azul', 'Faixa Preta'];

  const filtered = mockAthletes.filter(a => {
    const matchesSearch = `${a.name} ${a.surname} ${a.school}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'Todos') return matchesSearch;
    if (activeFilter === 'Faixa Preta') return matchesSearch && a.achievements.some(ach => ach.belt === 'Preta');
    if (activeFilter === 'Faixa Azul') return matchesSearch && a.achievements.some(ach => ach.belt === 'Azul');
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
    <div className="min-h-screen bg-main flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="min-h-screen flex items-center px-4 pt-20 pb-12 lg:pt-0 lg:pb-0">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="mb-8">
              <span className="font-display text-[13px] uppercase tracking-[0.15em] text-ink-faint">
                ◆ Certificação Esportiva
              </span>
            </div>

            <h1 className="font-display font-extrabold text-[64px] md:text-[96px] lg:text-[108px] text-ink mb-6" style={{ lineHeight: '0.88' }}>
              O PASSAPORTE<br />
              <span className="italic">DEFINITIVO</span><br />
              DO SEU ATLETA.
            </h1>

            <div className="w-16 h-px mb-6" style={{ backgroundColor: 'var(--color-accent)' }} />

            <p className="font-body text-lg text-ink-muted max-w-[480px] mb-12" style={{ lineHeight: '1.65' }}>
              Registre graduações. Gere autenticidade. Qualquer pessoa confirma a faixa do seu aluno escaneando um QR Code — para sempre.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link to="/#busca">
                <Button variant="hero" size="lg" className="hover:-translate-y-0.5 transition-transform duration-200">
                  Verificar um atleta
                </Button>
              </Link>
              <Link to="/cadastro" className="group font-body font-medium text-base text-ink inline-flex items-center gap-1 relative">
                <span className="relative">
                  Cadastrar minha escola
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-ink transition-all duration-300 group-hover:w-full" />
                </span>
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-body font-medium text-ink">{mockStats.totalAthletes.toLocaleString('pt-BR')}</span>
                <span className="font-body text-ink-faint ml-1.5">atletas</span>
              </div>
              <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />
              <div>
                <span className="font-body font-medium text-ink">{mockStats.totalSchools}</span>
                <span className="font-body text-ink-faint ml-1.5">escolas</span>
              </div>
              <div className="w-px h-4" style={{ backgroundColor: 'var(--color-border)' }} />
              <div>
                <span className="font-body font-medium text-ink">{mockStats.totalCertificates.toLocaleString('pt-BR')}</span>
                <span className="font-body text-ink-faint ml-1.5">certificados</span>
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

      {/* SEÇÃO 1: BUSCA DE ATLETAS */}
      <section id="busca" style={{ backgroundColor: '#F7F5F0', padding: '100px 0' }}>
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="font-display font-bold text-[48px] text-ink uppercase text-center mb-10" style={{ lineHeight: '1' }}>
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

      {/* SEÇÃO 2: COMO FUNCIONA */}
      <section id="como-funciona" style={{ backgroundColor: '#EDEAE3', padding: '100px 0' }}>
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="font-display font-bold text-[48px] text-ink uppercase mb-10" style={{ lineHeight: '1' }}>
            COMO FUNCIONA
          </h2>
          <div className="w-full h-px mb-0" style={{ backgroundColor: 'var(--color-border)' }} />
          {steps.map((step, i) => (
            <div key={step.num}>
              <div className="flex items-start gap-8 md:gap-12 py-10">
                <span className="font-display font-extrabold text-[64px] leading-none shrink-0" style={{ color: '#C8F135' }}>
                  {step.num}
                </span>
                <div className="pt-2">
                  <h3 className="font-body font-medium text-xl text-ink mb-2">{step.title}</h3>
                  <p className="font-body text-[15px] text-ink-muted max-w-lg" style={{ lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && <div className="w-full h-px" style={{ backgroundColor: 'var(--color-border)' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO 3: CTA FINAL */}
      <section style={{ backgroundColor: '#0D0D0D', padding: '120px 0' }}>
        <div className="container mx-auto max-w-3xl text-center px-4">
          <h2 className="font-display font-extrabold text-[48px] md:text-[80px] mb-6" style={{ color: '#FFFFFF', lineHeight: '0.9' }}>
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
      <footer style={{ backgroundColor: '#F7F5F0', borderTop: '1px solid #D4D0C8' }}>
        <div className="container mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="font-body text-[13px]" style={{ color: '#9A9590' }}>
            fightport.pro · © 2026 fightport.pro · SportCombat
          </p>
        </div>
      </footer>
    </div>
  );
}
