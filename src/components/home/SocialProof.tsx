export function SocialProof() {
  return (
    <section
      style={{
        background: 'var(--blue-deep)',
        padding: '18px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span
        className="font-display text-center"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        Academias ativas em → São Paulo · Rio de Janeiro · Curitiba · Belo Horizonte · Porto Alegre · Fortaleza
      </span>
    </section>
  );
}
