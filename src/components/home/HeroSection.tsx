import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BeamsBackground } from '@/components/ui/beams-background';

const statNumbers = ['1.247+', '89', '3.891'];

export function HeroSection() {
  const { t } = useTranslation();

  const stats = [
    { number: statNumbers[0], label: t('hero.stats.athletes') },
    { number: statNumbers[1], label: t('hero.stats.organizations') },
    { number: statNumbers[2], label: t('hero.stats.graduations') },
  ];

  // Parse title with <accent> tags
  const titleParts = t('hero.title').split(/<accent>(.*?)<\/accent>/);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: '90vh',
        background: '#0a0a0a',
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      {/* Beams background effect */}
      <BeamsBackground className="absolute inset-0" intensity="medium" />

      {/* Content */}
      <div className="fp-container relative" style={{ zIndex: 10 }}>
        <div className="section-inner">
          <p className="animate-fadeup delay-100" style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            {t('hero.badge')}
          </p>

          <h1 className="animate-fadeup delay-200" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(48px, 6.5vw, 80px)', lineHeight: 1.04, letterSpacing: '-0.04em', color: '#ffffff', maxWidth: 680, margin: 0 }}>
            {titleParts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} style={{ color: 'var(--color-accent)' }} dangerouslySetInnerHTML={{ __html: part }} />
              ) : (
                <span key={i} dangerouslySetInnerHTML={{ __html: part }} />
              )
            )}
          </h1>

          <p className="animate-fadeup delay-300" style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: 500, marginTop: 24 }}>
            {t('hero.subtitle')}
          </p>

          <div className="animate-fadeup delay-400 flex flex-wrap items-center" style={{ gap: 16, marginTop: 40 }}>
            <Link to="/cadastro" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg-amber)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '14px 28px', textDecoration: 'none', transition: 'var(--transition)', display: 'inline-block' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#e09600')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-amber)')}>
              {t('hero.ctaPrimary')}
            </Link>
            <a href="/#busca" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', padding: '14px 0', textDecoration: 'none', transition: 'var(--transition)' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
              {t('hero.ctaSecondary')}
            </a>
          </div>

          <div className="animate-fadeup delay-500 flex flex-wrap items-center" style={{ gap: 48, marginTop: 64 }}>
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center" style={{ gap: 48 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 400, color: '#ffffff', letterSpacing: '-0.02em' }}>{stat.number}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{stat.label}</div>
                </div>
                {i < stats.length - 1 && (
                  <div className="hidden md:block" style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          section > div:nth-child(2) { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
