import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/#busca', label: 'Verificar atleta' },
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/cadastro', label: 'Para escolas', isRoute: true },
];

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-[100] flex items-center justify-between"
        style={{
          height: 64,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 var(--section-px-sm)',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 15,
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            color: 'var(--color-text)',
          }}
        >
          fightport<span style={{ color: 'var(--color-accent)' }}>.pro</span>
        </Link>

        {/* Center nav links — hidden on mobile */}
        <div className="hidden md:flex items-center" style={{ gap: 32 }}>
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center" style={{ gap: 12 }}>
          {/* Entrar — text only */}
          <Link
            to="/login"
            className="hidden md:inline-block"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              padding: '8px 0',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            Entrar
          </Link>

          {/* Cadastre sua escola — primary */}
          <Link
            to="/cadastro"
            className="hidden md:inline-block"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 500,
              color: '#FFFFFF',
              background: 'var(--color-text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 20px',
              textDecoration: 'none',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-text)')}
          >
            Cadastre sua escola
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              color: 'var(--color-text)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div
            className="absolute top-0 right-0 h-full flex flex-col"
            style={{
              width: 300,
              background: '#FFFFFF',
              borderLeft: '1px solid var(--color-border)',
              padding: '20px 24px',
            }}
          >
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                }}
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: 24 }}>
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 18,
                      fontWeight: 400,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                    }}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 18,
                      fontWeight: 400,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                    }}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>

            {/* Mobile CTA buttons */}
            <div className="mt-auto flex flex-col" style={{ gap: 12, paddingBottom: 32 }}>
              <Link
                to="/login"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 400,
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  textAlign: 'center',
                  padding: '10px 0',
                }}
                onClick={() => setDrawerOpen(false)}
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  background: 'var(--color-text)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
                onClick={() => setDrawerOpen(false)}
              >
                Cadastre sua escola
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
