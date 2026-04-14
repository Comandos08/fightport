import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { FooterSection } from '@/components/home/FooterSection';
import { useSeo } from '@/hooks/useSeo';
import { useTranslation } from 'react-i18next';

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: 'var(--color-bg-amber)', marginBottom: 16,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 700, color: 'var(--color-text)',
  lineHeight: 1.3, marginBottom: 24, letterSpacing: '-0.02em', maxWidth: 600,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.85, color: 'var(--color-text-muted)', marginBottom: 20,
};

function Section({ bg, label, heading, paragraphs, children, showBackLink, backLinkText }: {
  bg: 'white' | 'gray'; label: string; heading: string; paragraphs: string[];
  children?: React.ReactNode; showBackLink?: boolean; backLinkText?: string;
}) {
  return (
    <section style={{ background: bg === 'gray' ? '#F9F9F9' : '#FFFFFF', padding: '80px 0' }}>
      <div className="fp-container" style={{ maxWidth: 760, margin: '0 auto' }}>
        {showBackLink && (
          <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: 48, transition: 'var(--transition)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
            {backLinkText}
          </Link>
        )}
        <p style={labelStyle}>{label}</p>
        <h2 style={sectionHeadingStyle}>{heading}</h2>
        {paragraphs.map((p, i) => (<p key={i} style={bodyStyle}>{p}</p>))}
        {children}
      </div>
    </section>
  );
}

export default function Sobre() {
  const { t } = useTranslation();

  useSeo({
    title: `${t('about.title')} — fightport.pro`,
    description: t('about.mission.heading'),
  });

  const stats = [
    { value: t('about.stats.s1.value'), label: t('about.stats.s1.label') },
    { value: t('about.stats.s2.value'), label: t('about.stats.s2.label') },
    { value: t('about.stats.s3.value'), label: t('about.stats.s3.label') },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <section style={{ background: 'var(--color-text)', padding: '80px 0 60px', textAlign: 'center' }}>
        <div className="fp-container">
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: '#FFFFFF', maxWidth: 460, margin: '0 auto' }}>
            {t('about.title')}
          </h1>
        </div>
      </section>

      <Section bg="white" label={t('about.mission.label')} heading={t('about.mission.heading')}
        paragraphs={[t('about.mission.p1'), t('about.mission.p2')]} showBackLink backLinkText={t('about.backLink')} />

      <Section bg="gray" label={t('about.problemSection.label')} heading={t('about.problemSection.heading')}
        paragraphs={[t('about.problemSection.p1'), t('about.problemSection.p2')]}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 40 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '28px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section bg="white" label={t('about.howItWorks.label')} heading={t('about.howItWorks.heading')}
        paragraphs={[t('about.howItWorks.p1'), t('about.howItWorks.p2')]} />

      <Section bg="gray" label={t('about.whoWeAre.label')} heading={t('about.whoWeAre.heading')}
        paragraphs={[t('about.whoWeAre.p1'), t('about.whoWeAre.p2'), t('about.whoWeAre.p3')]} />

      <section style={{ background: 'var(--color-text)', padding: '80px 0', textAlign: 'center' }}>
        <div className="fp-container" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 700, color: '#FFFFFF', marginBottom: 16, letterSpacing: '-0.02em' }}>
            {t('about.ctaSection.title')}
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 32, lineHeight: 1.6 }}>
            {t('about.ctaSection.subtitle')}
          </p>
          <Link to="/cadastro" style={{ display: 'inline-block', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: '#000000', background: 'var(--color-bg-amber)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '14px 32px', textDecoration: 'none', transition: 'var(--transition)' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {t('about.ctaSection.button')}
          </Link>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
