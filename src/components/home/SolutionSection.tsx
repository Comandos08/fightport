import { CheckCircle, Lock, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SolutionSection() {
  const { t } = useTranslation();

  const items = [
    { num: '01', icon: CheckCircle, title: t('solution.item1.title'), desc: t('solution.item1.desc') },
    { num: '02', icon: Lock, title: t('solution.item2.title'), desc: t('solution.item2.desc') },
    { num: '03', icon: Award, title: t('solution.item3.title'), desc: t('solution.item3.desc') },
  ];

  return (
    <section style={{ background: 'var(--color-bg-dark)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            {t('solution.badge')}
          </p>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: '#FFFFFF', maxWidth: 560, marginTop: 24, marginBottom: 64 }}>
            {t('solution.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1 }}>
            {items.map((item) => (
              <div key={item.num} style={{ background: 'rgba(255,255,255,0.04)', padding: '40px 32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginBottom: 48 }}>{item.num}</p>
                <item.icon size={28} color="rgba(255,255,255,0.6)" />
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 20, color: '#FFFFFF', letterSpacing: '-0.01em', marginTop: 24, marginBottom: 12 }}>{item.title}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
