const stats = [
  { number: '72%', desc: 'plataformas de certificação falham por falta de padrão', source: 'FONTE: VFUNCTION, 2022' },
  { number: '50%', desc: 'dos árbitros não têm como verificar a graduação real', source: 'ESTIMATIVA INTERNA, 2024' },
  { number: '5 anos', desc: 'de treino que qualquer um pode falsificar com uma impressora', source: 'REALIDADE DO MERCADO' },
];

export function ProblemSection() {
  return (
    <section style={{ background: 'var(--color-bg-amber)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner grid grid-cols-1 md:grid-cols-2" style={{ gap: 64 }}>
          {/* Left */}
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 48 }}>
              O PROBLEMA
            </p>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--color-text)', maxWidth: 460, margin: 0 }}>
              Certificados físicos são fáceis de falsificar.
            </h2>
          </div>

          {/* Right — stat cards */}
          <div className="flex flex-col" style={{ gap: 2 }}>
            {stats.map((s) => (
              <div key={s.number} style={{ background: 'rgba(0,0,0,0.08)', padding: '28px 24px', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1, color: 'var(--color-text)' }}>{s.number}</div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'var(--color-text)', opacity: 0.75, marginTop: 8, maxWidth: 280 }}>{s.desc}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text)', opacity: 0.45, marginTop: 12 }}>{s.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
