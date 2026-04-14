import { Link } from 'react-router-dom';

const stats = [
  { number: '1.247+', label: 'atletas certificados' },
  { number: '89', label: 'organizações ativas' },
  { number: '3.891', label: 'graduações registradas' },
];

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: '90vh',
        background: '#FFFFFF',
        paddingTop: 120,
        paddingBottom: 80,
      }}
    >
      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 85% 20%, rgba(245,166,35,0.12) 0%, rgba(19,76,115,0.06) 50%, transparent 70%)',
        }}
      />

      {/* Geometric rectangles — right side decoration */}
      <div
        className="absolute top-0 right-0 pointer-events-none overflow-hidden hidden md:block"
        style={{ width: '45%', height: '100%' }}
      >
        <div style={{ position: 'absolute', top: '10%', right: -40, width: 280, height: 400, background: 'rgba(19,76,115,0.07)', borderRadius: 'var(--radius-md)', transform: 'rotate(8deg) translateX(60px)' }} />
        <div style={{ position: 'absolute', top: '15%', right: -40, width: 220, height: 320, background: 'rgba(19,76,115,0.05)', borderRadius: 'var(--radius-md)', transform: 'rotate(8deg) translateX(120px) translateY(60px)' }} />
        <div style={{ position: 'absolute', top: '20%', right: -40, width: 160, height: 280, background: 'rgba(19,76,115,0.04)', borderRadius: 'var(--radius-md)', transform: 'rotate(8deg) translateX(170px) translateY(120px)' }} />
      </div>

      {/* Content */}
      <div className="fp-container relative">
        <div className="section-inner">
          <p className="animate-fadeup delay-100" style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 32 }}>
            CERTIFICAÇÃO ESPORTIVA → ORGANIZAÇÕES DE ARTES MARCIAIS
          </p>

          <h1 className="animate-fadeup delay-200" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(48px, 6.5vw, 80px)', lineHeight: 1.04, letterSpacing: '-0.04em', color: 'var(--color-text)', maxWidth: 680, margin: 0 }}>
            A graduação<br />do seu atleta,<br /><span style={{ color: 'var(--color-accent)' }}>imutável.</span>
          </h1>

          <p className="animate-fadeup delay-300" style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 300, color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: 500, marginTop: 24 }}>
            Qualquer pessoa verifica a faixa do seu aluno em segundos — escaneando um QR Code. Para sempre. Sem falsificação possível.
          </p>

          <div className="animate-fadeup delay-400 flex flex-wrap items-center" style={{ gap: 16, marginTop: 40 }}>
            <Link to="/cadastro" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 500, color: 'var(--color-text)', background: 'var(--color-bg-amber)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '14px 28px', textDecoration: 'none', transition: 'var(--transition)', display: 'inline-block' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#e09600')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-amber)')}>
              Cadastrar minha organização
            </Link>
            <a href="/#busca" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'var(--color-text-muted)', background: 'transparent', border: 'none', padding: '14px 0', textDecoration: 'none', transition: 'var(--transition)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
              Verificar um atleta →
            </a>
          </div>

          <div className="animate-fadeup delay-500 flex flex-wrap items-center" style={{ gap: 48, marginTop: 64 }}>
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center" style={{ gap: 48 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 400, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>{stat.number}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 4 }}>{stat.label}</div>
                </div>
                {i < stats.length - 1 && (
                  <div className="hidden md:block" style={{ width: 1, height: 40, background: 'var(--color-border)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          section > div:nth-child(2) { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
