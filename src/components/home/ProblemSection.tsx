import { useTranslation } from 'react-i18next';

export function ProblemSection() {
  const { t } = useTranslation();

  const stats = [
    { number: t('problem.stat1.number'), desc: t('problem.stat1.desc'), source: t('problem.stat1.source') },
    { number: t('problem.stat2.number'), desc: t('problem.stat2.desc'), source: t('problem.stat2.source') },
    { number: t('problem.stat3.number'), desc: t('problem.stat3.desc'), source: t('problem.stat3.source') },
  ];

  return (
    <section style={{ background: 'var(--color-bg-amber)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner grid grid-cols-1 md:grid-cols-2" style={{ gap: 64 }}>
          {/* Left */}
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 48 }}>
              {t('problem.badge')}
            </p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--color-text)', maxWidth: 460, margin: 0 }}>
              {t('problem.title')}
            </h2>
          </div>

          {/* Right — stat cards */}
          <div className="flex flex-col" style={{ gap: 2 }}>
            {stats.map((s) => (
              <div key={s.number} style={{ background: 'rgba(0,0,0,0.08)', padding: '28px 24px', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--color-text)' }}>{s.number}</div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 300, color: 'var(--color-text)', opacity: 0.75, marginTop: 8, maxWidth: 280 }}>{s.desc}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text)', opacity: 0.45, marginTop: 12 }}>{s.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
