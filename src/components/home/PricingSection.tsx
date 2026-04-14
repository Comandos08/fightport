import { Link } from 'react-router-dom';

const packages = [
  {
    name: 'Starter',
    credits: 10,
    price: 'R$ 49',
    unit: 'R$ 4,90 / crédito',
    highlight: false,
  },
  {
    name: 'Escola',
    credits: 30,
    price: 'R$ 119',
    unit: 'R$ 3,97 / crédito',
    highlight: true,
  },
  {
    name: 'Academia',
    credits: 80,
    price: 'R$ 249',
    unit: 'R$ 3,11 / crédito',
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section
      className="px-6 md:px-10"
      style={{
        background: 'var(--bg)',
        padding: '100px 40px',
        borderTop: '1px solid var(--border-2)',
      }}
    >
      <div className="container mx-auto max-w-7xl text-center">
        {/* Label */}
        <div className="flex items-center justify-center" style={{ gap: 10, marginBottom: 20 }}>
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
            ◆ PREÇOS
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
            marginBottom: 16,
          }}
        >
          Você só paga quando graduar.
        </h2>

        {/* Subtitle */}
        <p
          className="font-body mx-auto"
          style={{
            fontSize: 17,
            fontWeight: 400,
            color: 'var(--muted)',
            maxWidth: 440,
            marginBottom: 56,
          }}
        >
          Sem mensalidade. Sem contrato. Créditos nunca expiram.
        </p>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 mx-auto"
          style={{ gap: 16, maxWidth: 860 }}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="relative"
              style={{
                background: 'var(--white)',
                border: pkg.highlight
                  ? '2px solid var(--blue-deep)'
                  : '1px solid var(--border-2)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px',
                transform: pkg.highlight ? 'scale(1.04)' : 'none',
                boxShadow: pkg.highlight ? 'var(--shadow-btn)' : 'none',
              }}
            >
              {/* Popular badge */}
              {pkg.highlight && (
                <span
                  className="font-display absolute"
                  style={{
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--terra)',
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    padding: '5px 16px',
                    borderRadius: 100,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Mais popular
                </span>
              )}

              {/* Plan name */}
              <p
                className="font-display"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted)',
                  marginBottom: 16,
                }}
              >
                {pkg.name}
              </p>

              {/* Credits */}
              <p
                className="font-display"
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: 'var(--blue-deep)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                }}
              >
                {pkg.credits}
              </p>
              <p
                className="font-body"
                style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', marginBottom: 16 }}
              >
                créditos
              </p>

              {/* Price */}
              <p
                className="font-display"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginTop: 16,
                }}
              >
                {pkg.price}
              </p>
              <p
                className="font-body"
                style={{ fontSize: 12, fontWeight: 400, color: 'var(--muted)', marginBottom: 24 }}
              >
                {pkg.unit}
              </p>

              {/* CTA */}
              <Link
                to="/cadastro"
                className="font-display block text-center"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                  ...(pkg.highlight
                    ? {
                        background: 'var(--terra)',
                        color: '#ffffff',
                        border: 'none',
                      }
                    : {
                        background: 'transparent',
                        color: 'var(--blue-deep)',
                        border: '1.5px solid var(--border-2)',
                      }),
                }}
                onMouseEnter={(e) => {
                  if (pkg.highlight) {
                    e.currentTarget.style.background = '#b83515';
                  } else {
                    e.currentTarget.style.background = 'var(--blue-light)';
                    e.currentTarget.style.borderColor = 'var(--blue-mid)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pkg.highlight) {
                    e.currentTarget.style.background = 'var(--terra)';
                  } else {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-2)';
                  }
                }}
              >
                Começar agora
              </Link>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p
          className="font-body"
          style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', marginTop: 28 }}
        >
          Créditos nunca expiram. Use quando quiser.
        </p>
      </div>
    </section>
  );
}
