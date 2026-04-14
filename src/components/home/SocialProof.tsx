export function SocialProof() {
  const cities = 'São Paulo · Rio de Janeiro · Curitiba · Belo Horizonte · Porto Alegre · Fortaleza · Recife';

  return (
    <section
      style={{
        background: 'var(--color-bg-soft)',
        padding: '20px 0',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}
    >
      <div className="fp-container flex items-center" style={{ gap: 40 }}>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          ORGANIZAÇÕES ATIVAS EM →
        </span>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div className="marquee-track">
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {cities}
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              {cities}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
