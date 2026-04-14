import { Link } from 'react-router-dom';

export function FooterSection() {
  return (
    <footer
      className="px-6 md:px-10"
      style={{
        background: 'var(--blue-deep)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '48px 40px 28px',
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Left */}
          <div>
            <div className="flex items-baseline">
              <span
                className="font-display"
                style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}
              >
                FIGHT PORT
              </span>
              <span
                className="font-display"
                style={{ fontSize: 18, fontWeight: 700, color: 'var(--terra)' }}
              >
                .PRO
              </span>
            </div>
            <p
              className="font-body"
              style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}
            >
              O passaporte digital do seu atleta.
            </p>
            <p
              className="font-body"
              style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}
            >
              © 2026 FightPort.pro · SportCombat
            </p>
          </div>

          {/* Right — link groups */}
          <div className="flex flex-wrap" style={{ gap: 48 }}>
            <div className="flex flex-col" style={{ gap: 10 }}>
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 4,
                }}
              >
                Produto
              </span>
              <a href="/#busca" className="font-body" style={linkStyle}>
                Verificar atleta
              </a>
              <a href="/#como-funciona" className="font-body" style={linkStyle}>
                Como funciona
              </a>
              <a href="/#precos" className="font-body" style={linkStyle}>
                Preços
              </a>
            </div>

            <div className="flex flex-col" style={{ gap: 10 }}>
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 4,
                }}
              >
                Empresa
              </span>
              <a href="/sobre" className="font-body" style={linkStyle}>
                Sobre nós
              </a>
              <a href="/contato" className="font-body" style={linkStyle}>
                Contato
              </a>
            </div>

            <div className="flex flex-col" style={{ gap: 10 }}>
              <span
                className="font-display"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.25)',
                  marginBottom: 4,
                }}
              >
                Legal
              </span>
              <Link to="/termos" className="font-body" style={linkStyle}>
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="font-body" style={linkStyle}>
                Política de Privacidade
              </Link>
              <a href="/lgpd" className="font-body" style={linkStyle}>
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.4)',
  textDecoration: 'none',
  transition: 'var(--transition)',
};
