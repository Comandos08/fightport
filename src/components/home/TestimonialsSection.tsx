const testimonials = [
  {
    text: 'O fightport.pro trouxe credibilidade real para a nossa academia. Os pais dos alunos pedem o link antes de matricular.',
    name: 'Prof. Ricardo Almeida',
    role: 'Faixa Preta 5° Grau · Academia Tiger BJJ, SP',
    initials: 'RA',
    accent: 'var(--blue-deep)',
  },
  {
    text: 'Na hora de registrar para o campeonato, o árbitro escaneou o QR e aceitou na hora. Zero burocracia.',
    name: 'Carlos Mendes',
    role: 'Atleta Faixa Roxa · Gracie Barra RJ',
    initials: 'CM',
    accent: 'var(--terra)',
  },
  {
    text: 'Implantei em 20 minutos. Agora cada graduação vira um momento especial — o aluno recebe o link na hora.',
    name: 'Prof. Ana Freitas',
    role: 'Head Coach · Alliance SP',
    initials: 'AF',
    accent: 'var(--blue-deep)',
  },
];

export function TestimonialsSection() {
  return (
    <section
      className="px-6 md:px-10"
      style={{
        background: 'var(--bg-2)',
        padding: '100px 40px',
        borderTop: '1px solid var(--border-2)',
      }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Label */}
        <div className="flex items-center" style={{ gap: 10, marginBottom: 20 }}>
          <div style={{ width: 20, height: 1.5, background: 'var(--terra)' }} />
          <span
            className="font-display"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
            }}
          >
            ◆ O QUE DIZEM NOSSAS ACADEMIAS
          </span>
        </div>

        {/* H2 */}
        <h2
          className="font-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 50px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--ink)',
            marginBottom: 48,
          }}
        >
          Quem usa, confia.
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                borderTop: `3px solid ${t.accent}`,
              }}
            >
              {/* Quote mark */}
              <span
                className="font-display block"
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: 'var(--blue-light)',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                &ldquo;
              </span>

              {/* Text */}
              <p
                className="font-body"
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'var(--muted)',
                  lineHeight: 1.72,
                }}
              >
                {t.text}
              </p>

              {/* Separator */}
              <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="font-display"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, var(--terra-soft), var(--terra))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="font-display"
                    style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="font-body"
                    style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
