import { Link } from 'react-router-dom';

const packages = [
  { name: 'Starter', credits: '10', price: 'R$ 97', unit: 'R$ 9,70/un', highlight: false },
  { name: 'Escola', credits: '50', price: 'R$ 397', unit: 'R$ 7,94/un', highlight: true },
  { name: 'Academia', credits: '150', price: 'R$ 990', unit: 'R$ 6,60/un', highlight: false },
];

const thStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  padding: '0 0 16px 0',
};

export function PricingSection() {
  return (
    <section style={{ background: 'var(--color-bg-soft)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            PREÇOS
          </p>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)', marginTop: 24 }}>
            Você só paga quando graduar.
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 16, marginBottom: 64 }}>
            Sem mensalidade. Sem contrato. Créditos nunca expiram.
          </p>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '35%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-text)' }}>
                  <th style={{ ...thStyle, textAlign: 'left' }}>PLANO</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>CRÉDITOS</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>PREÇO</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>POR GRAD.</th>
                  <th style={{ padding: '0 0 16px 0' }}></th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => {
                  const isHL = pkg.highlight;
                  const tdBase: React.CSSProperties = {
                    padding: '24px 0',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  };
                  return (
                    <tr
                      key={pkg.name}
                      style={{
                        background: isHL ? 'var(--color-bg-amber)' : 'transparent',
                      }}
                    >
                      <td style={{
                        ...tdBase,
                        padding: isHL ? '24px 20px' : '24px 0',
                        borderBottom: isHL ? 'none' : '1px solid var(--color-border)',
                        borderRadius: isHL ? '6px 0 0 6px' : 0,
                      }}>
                        {pkg.name}
                        {isHL && (
                          <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            background: '#1C1C1C',
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            borderRadius: 3,
                            marginLeft: 10,
                            verticalAlign: 'middle',
                          }}>
                            MAIS POPULAR
                          </span>
                        )}
                      </td>
                      <td style={{
                        ...tdBase,
                        textAlign: 'right',
                        borderBottom: isHL ? 'none' : '1px solid var(--color-border)',
                      }}>
                        {pkg.credits}
                      </td>
                      <td style={{
                        ...tdBase,
                        textAlign: 'right',
                        borderBottom: isHL ? 'none' : '1px solid var(--color-border)',
                      }}>
                        {pkg.price}
                      </td>
                      <td style={{
                        ...tdBase,
                        textAlign: 'right',
                        fontSize: 13,
                        fontWeight: 400,
                        color: isHL ? 'var(--color-text)' : 'var(--color-text-muted)',
                        opacity: isHL ? 0.65 : 1,
                        borderBottom: isHL ? 'none' : '1px solid var(--color-border)',
                      }}>
                        {pkg.unit}
                      </td>
                      <td style={{
                        ...tdBase,
                        textAlign: 'right',
                        padding: isHL ? '24px 20px' : '24px 0',
                        borderBottom: isHL ? 'none' : '1px solid var(--color-border)',
                        borderRadius: isHL ? '0 6px 6px 0' : 0,
                      }}>
                        <Link
                          to="/cadastro"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col" style={{ gap: 12 }}>
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  padding: '20px',
                  background: pkg.highlight ? 'var(--color-bg-amber)' : 'transparent',
                  border: pkg.highlight ? 'none' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 17, color: 'var(--color-text)' }}>{pkg.name}</span>
                    {pkg.highlight && (
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1C1C1C', color: '#FFFFFF', padding: '2px 8px', borderRadius: 3 }}>MAIS POPULAR</span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 17, color: 'var(--color-text)' }}>{pkg.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>{pkg.credits} créditos · {pkg.unit}</span>
                  <Link to="/cadastro" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', textDecoration: 'none' }}>Comprar →</Link>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 24 }}>
            Créditos nunca expiram. Use quando quiser.
          </p>
        </div>
      </div>
    </section>
  );
}
