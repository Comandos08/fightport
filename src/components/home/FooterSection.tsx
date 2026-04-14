import { Link } from 'react-router-dom';

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 300,
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
  transition: 'var(--transition)',
  marginBottom: 10,
};

export function FooterSection() {
  return (
    <footer style={{ background: 'var(--color-bg-dark)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="fp-container" style={{ padding: '48px 0 32px' }}>
        <div className="section-inner flex flex-col md:flex-row md:justify-between md:items-start" style={{ gap: 48 }}>
          {/* Left */}
          <div>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, color: '#FFFFFF' }}>
              fightport<span style={{ color: 'var(--color-accent)' }}>.pro</span>
            </span>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              O passaporte digital do seu atleta.
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}>
              © 2026 FightPort.pro · <a href="https://sportcombat.pro" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>SportCombat</a>
            </p>
          </div>

          {/* Right — link groups */}
          <div className="flex flex-wrap" style={{ gap: 48 }}>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Produto</span>
              <a href="/#busca" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Verificar atleta</a>
              <a href="/#como-funciona" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Como funciona</a>
              <a href="/#precos" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Preços</a>
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Empresa</span>
              <a href="/sobre" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Sobre nós</a>
              <a href="/contato" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Contato</a>
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Legal</span>
              <Link to="/termos" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Termos de Uso</Link>
              <Link to="/privacidade" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>Privacidade</Link>
              <a href="/lgpd" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>LGPD</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
