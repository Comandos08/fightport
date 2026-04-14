import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { mockAthletes, mockStats } from '@/lib/mock-data';
import { CheckCircle, QrCode } from 'lucide-react';
import { beltColor, beltTextColor } from '@/lib/utils';

function HeroPassportCard() {
  const athlete = mockAthletes[0];
  const achievements = [...athlete.achievements].reverse();

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
      {/* Subtle glow behind */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 600px at 50% 50%, rgba(200,241,53,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Layer 1 - Background grid frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute"
        style={{
          width: '380px',
          height: '520px',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          transform: 'rotateY(8deg) rotateX(-4deg)',
          transformStyle: 'preserve-3d',
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(212,208,200,0.3) 19px, rgba(212,208,200,0.3) 20px),
            repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(212,208,200,0.3) 19px, rgba(212,208,200,0.3) 20px)`,
        }}
      />

      {/* Layer 2 - Main passport card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 bg-popover"
        style={{
          width: '340px',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
          transform: 'rotateY(-6deg) rotateX(3deg)',
          transformStyle: 'preserve-3d',
          padding: '24px',
        }}
      >
        {/* Verified badge */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-full w-fit" style={{ backgroundColor: 'var(--color-verified-bg)' }}>
          <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-verified)' }} />
          <span className="font-display font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--color-verified)' }}>
            Verificado
          </span>
        </div>

        {/* Athlete info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-lg shrink-0" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
            CM
          </div>
          <div>
            <p className="font-display font-bold text-lg text-ink leading-tight">{athlete.name} {athlete.surname}</p>
            <p className="font-body text-sm text-ink-muted">{athlete.school} · {athlete.sport}</p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Mini timeline */}
        <div className="space-y-3 mb-4">
          {achievements.map((ach, i) => (
            <div key={ach.id} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: beltColor(ach.belt), border: ach.belt === 'Branca' ? '1px solid var(--color-border)' : undefined }} />
              <span
                className="px-2 py-0.5 rounded-full text-xs font-body font-medium"
                style={{ backgroundColor: beltColor(ach.belt), color: beltTextColor(ach.belt), border: ach.belt === 'Branca' ? '1px solid var(--color-border)' : undefined }}
              >
                {ach.belt}
              </span>
              <span className="font-body text-xs text-ink-faint">{new Date(ach.date + 'T00:00:00').getFullYear()}</span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-mono-hash text-[11px] text-ink-faint">{achievements[0]?.hashPartial}</span>
          {/* Simple QR placeholder */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-40">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
            <rect x="28" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="32" y="8" width="8" height="8" rx="1" fill="currentColor" />
            <rect x="4" y="28" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <rect x="8" y="32" width="8" height="8" rx="1" fill="currentColor" />
            <rect x="28" y="28" width="4" height="4" fill="currentColor" />
            <rect x="36" y="28" width="4" height="4" fill="currentColor" />
            <rect x="28" y="36" width="4" height="4" fill="currentColor" />
            <rect x="36" y="36" width="8" height="8" rx="1" fill="currentColor" />
          </svg>
        </div>
      </motion.div>

      {/* Layer 3 - Floating mini-cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute z-20 bg-popover p-3 rounded-xl flex items-center gap-2"
        style={{
          top: '8%',
          right: '2%',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          animation: 'heroFloat 3s ease-in-out infinite',
        }}
      >
        <CheckCircle className="w-4 h-4" style={{ color: 'var(--color-verified)' }} />
        <span className="font-body text-[13px] text-ink-muted whitespace-nowrap">Verificado em 0,3s</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute z-20 bg-popover p-3 rounded-xl flex items-center gap-2"
        style={{
          bottom: '12%',
          left: '0%',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          animation: 'heroFloat 3s ease-in-out infinite 1.5s',
        }}
      >
        <QrCode className="w-4 h-4 text-ink-muted" />
        <span className="font-body text-[13px] text-ink-muted whitespace-nowrap">QR Code gerado</span>
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="min-h-screen flex items-center px-4 pt-20 pb-12 lg:pt-0 lg:pb-0">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left column */}
        <motion.div
          className="lg:col-span-7"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Category tag */}
          <motion.div variants={item} className="mb-8">
            <span className="font-display text-[13px] uppercase tracking-[0.15em] text-ink-faint">
              ◆ Certificação Esportiva
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-display font-extrabold text-[64px] md:text-[96px] lg:text-[108px] text-ink mb-6"
            style={{ lineHeight: '0.88' }}
          >
            O PASSAPORTE<br />
            <span className="italic">DEFINITIVO</span><br />
            DO SEU ATLETA.
          </motion.h1>

          {/* Decorative line */}
          <motion.div variants={item} className="w-16 h-px mb-6" style={{ backgroundColor: 'var(--color-accent)' }} />

          {/* Subheadline */}
          <motion.p
            variants={item}
            className="font-body text-lg text-ink-muted max-w-[480px] mb-12"
            style={{ lineHeight: '1.65' }}
          >
            Registre graduações. Gere autenticidade. Qualquer pessoa confirma a faixa do seu aluno escaneando um QR Code — para sempre.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap items-center gap-4 mb-12">
            <Link to="/#busca">
              <Button
                variant="hero"
                size="lg"
                className="hover:-translate-y-0.5 transition-transform duration-200"
              >
                Verificar um atleta
              </Button>
            </Link>
            <Link
              to="/cadastro"
              className="group font-body font-medium text-base text-ink inline-flex items-center gap-1 relative"
            >
              <span className="relative">
                Cadastrar minha escola
                <span className="absolute bottom-0 left-0 w-0 h-px bg-ink transition-all duration-300 group-hover:w-full" />
              </span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* Stats counter */}
          <motion.div variants={item} className="flex items-center gap-4 text-sm">
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
          </motion.div>
        </motion.div>

        {/* Right column - 3D visual */}
        <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center" style={{ minHeight: '600px' }}>
          <HeroPassportCard />
        </div>
      </div>
    </section>
  );
}
