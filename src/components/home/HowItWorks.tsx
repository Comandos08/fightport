import { useTranslation } from 'react-i18next';

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    { num: '01', title: t('process.step1.title'), desc: t('process.step1.desc'), badge: t('process.step1.tag') },
    { num: '02', title: t('process.step2.title'), desc: t('process.step2.desc'), badge: t('process.step2.tag') },
    { num: '03', title: t('process.step3.title'), desc: t('process.step3.desc'), badge: t('process.step3.tag') },
  ];

  return (
    <section id="como-funciona" style={{ background: 'var(--color-bg)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            {t('process.badge')}
          </p>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: 'var(--color-text)', maxWidth: 480, marginTop: 24, marginBottom: 80 }}>
            {t('process.title')}
          </h2>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} style={{ paddingRight: i < steps.length - 1 ? 40 : 0, borderRight: i < steps.length - 1 ? '1px solid #E8E8E5' : 'none', paddingLeft: i > 0 ? 40 : 0 }}>
                <StepContent step={step} />
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col">
            {steps.map((step, i) => (
              <div key={step.num} style={{ paddingBottom: i < steps.length - 1 ? 40 : 0, borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none', paddingTop: i > 0 ? 40 : 0 }}>
                <StepContent step={step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepContent({ step }: { step: { num: string; title: string; desc: string; badge: string } }) {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', marginBottom: 80 }}>{step.num}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 22, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 16 }}>{step.title}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 300, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', padding: '4px 10px', borderRadius: 'var(--radius-xs)', display: 'inline-block', marginTop: 24 }}>{step.badge}</span>
    </>
  );
}
