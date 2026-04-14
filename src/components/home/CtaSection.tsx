import { Link } from 'react-router-dom';

export function CtaSection() {
  return (
    <section
      style={{
        background: 'var(--color-bg-dark)',
        padding: 'var(--section-py) var(--section-px-sm)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 'clamp(40px, 5.5vw, 68px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.06,
            color: '#FFFFFF',
            maxWidth: 600,
          }}
        >
          Sua academia merece isso.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 17,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.65,
            maxWidth: 460,
            marginTop: 24,
          }}
        >
          Cadastro gratuito. Você só paga quando graduar o atleta.
        </p>
        <Link
          to="/cadastro"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 500,
            color: '#1C1C1C',
            background: 'var(--color-bg-amber)',
            padding: '14px 28px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            marginTop: 40,
            transition: 'var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e09600')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-amber)')}
        >
          Cadastrar minha academia →
        </Link>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 20,
          }}
        >
          Sem cartão de crédito · Sem contrato · Cancele quando quiser
        </p>
      </div>
    </section>
  );
}
