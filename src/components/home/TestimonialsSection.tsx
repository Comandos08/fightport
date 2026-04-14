const testimonials = [
  {
    text: 'O fightport.pro trouxe credibilidade para a nossa academia. Os pais pedem o link antes de matricular.',
    name: 'Prof. Ricardo Almeida',
    role: 'Faixa Preta 5° Grau · Academia Tiger BJJ, SP',
    initials: 'RA',
  },
  {
    text: 'O árbitro escaneou o QR na hora do check-in do campeonato e aceitou na hora. Zero burocracia.',
    name: 'Carlos Mendes',
    role: 'Atleta Faixa Roxa · Gracie Barra RJ',
    initials: 'CM',
  },
  {
    text: 'Implantei em 20 minutos. Cada graduação virou um momento especial — o aluno recebe o link na hora.',
    name: 'Prof. Ana Freitas',
    role: 'Head Coach · Alliance SP',
    initials: 'AF',
  },
];

export function TestimonialsSection() {
  return (
    <section
      style={{
        background: 'var(--color-bg)',
        padding: 'var(--section-py) var(--section-px-sm)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          O QUE DIZEM AS ACADEMIAS
        </p>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)', marginTop: 24, marginBottom: 64 }}>
          Quem usa, não volta atrás.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 48 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ borderTop: '2px solid var(--color-border-dark)', paddingTop: 32 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 48, color: 'var(--color-border-dark)', lineHeight: 0.8, display: 'block', marginBottom: 16 }}>
                &ldquo;
              </span>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 400, fontStyle: 'italic', color: 'var(--color-text)', lineHeight: 1.7, marginBottom: 28 }}>
                {t.text}
              </p>
              <div style={{ height: 1, background: 'var(--color-border)', margin: '20px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{t.name}</p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
