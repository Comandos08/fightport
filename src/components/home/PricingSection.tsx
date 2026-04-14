import { Link } from 'react-router-dom';

const packages = [
  { name: 'Starter', credits: '10', price: 'R$ 97', unit: 'R$ 9,70', highlight: false },
  { name: 'Escola', credits: '30', price: 'R$ 119', unit: 'R$ 3,97', highlight: true },
  { name: 'Academia', credits: '80', price: 'R$ 249', unit: 'R$ 3,11', highlight: false },
];

export function PricingSection() {
  return (
    <section
      style={{
        background: 'var(--color-bg-soft)',
        padding: 'var(--section-py) var(--section-px-sm)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          PREÇOS
        </p>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)', marginTop: 24 }}>
          Você só paga quando graduar.
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 16, marginBottom: 64 }}>
          Sem mensalidade. Sem contrato. Créditos nunca expiram.
        </p>

        {/* Table header — desktop */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: '1fr 120px 120px 120px 120px',
            borderBottom: '2px solid var(--color-border-dark)',
            paddingBottom: 16,
          }}
        >
          {['PLANO', 'CRÉDITOS', 'PREÇO', 'POR GRADUAÇÃO', ''].map((h) => (
            <span key={h} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className="grid grid-cols-2 md:grid-cols-[1fr_120px_120px_120px_120px]"
            style={{
              padding: pkg.highlight ? '24px 20px' : '24px 0',
              borderBottom: pkg.highlight ? 'none' : '1px solid var(--color-border)',
              background: pkg.highlight ? 'var(--color-bg-amber)' : 'transparent',
              borderRadius: pkg.highlight ? 'var(--radius-sm)' : 0,
              alignItems: 'center',
              gap: '8px 0',
            }}
          >
            {/* Name */}
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)' }}>
                {pkg.name}
              </span>
              {pkg.highlight && (
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1C1C1C', color: '#FFFFFF', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                  Mais popular
                </span>
              )}
            </div>

            {/* Credits */}
            <span className="hidden md:block" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)' }}>
              {pkg.credits}
            </span>

            {/* Price */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)', textAlign: 'right' }} className="md:text-left">
              {pkg.price}
            </span>

            {/* Per unit */}
            <span className="hidden md:block" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 14, color: 'var(--color-text-muted)' }}>
              {pkg.unit}
            </span>

            {/* CTA */}
            <Link
              to="/cadastro"
              className="hidden md:inline-block"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 14,
                color: 'var(--color-text)',
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Comprar →
            </Link>
          </div>
        ))}

        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 24 }}>
          Créditos nunca expiram. Use quando quiser.
        </p>
      </div>
    </section>
  );
}
