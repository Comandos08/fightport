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
        className="sticky top-0 z-[100] flex items-center justify-between px-6 md:px-10"
        style={{
          height: 62,
          background: 'rgba(248,248,248,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-2)',
          padding: '0 40px',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-baseline gap-0 shrink-0">
          <span
            className="font-display font-bold"
            style={{ fontSize: 16, letterSpacing: '0.04em', color: 'var(--ink)' }}
          >
            FIGHT
          </span>
          <span
            className="font-display font-bold"
            style={{ fontSize: 16, letterSpacing: '0.04em', color: 'var(--ink)' }}
          >
            PORT
          </span>
          <span
            className="font-display font-bold"
            style={{ fontSize: 16, letterSpacing: '0.04em', color: 'var(--terra)' }}
          >
            .PRO
          </span>
        </Link>

        {/* Center nav links — hidden on mobile */}
        <div className="hidden md:flex items-center" style={{ gap: 28 }}>
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className="font-body"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--muted)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="font-body"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--muted)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Right side buttons + hamburger */}
        <div className="flex items-center" style={{ gap: 10 }}>
          {/* Entrar — ghost */}
          <Link
            to="/login"
            className="font-display font-bold uppercase shrink-0"
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              color: 'var(--blue-deep)',
              background: 'transparent',
              border: '1.5px solid var(--border-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 18px',
              transition: 'var(--transition)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--blue-light)';
              e.currentTarget.style.borderColor = 'var(--blue-mid)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-2)';
            }}
          >
            Entrar
          </Link>

          {/* Cadastre sua escola — primary */}
          <Link
            to="/cadastro"
            className="font-display font-bold uppercase shrink-0"
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              color: '#ffffff',
              background: 'var(--blue-deep)',
              border: '2px solid var(--blue-deep)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 18px',
              transition: 'var(--transition)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--blue-mid)';
              e.currentTarget.style.borderColor = 'var(--blue-mid)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--blue-deep)';
              e.currentTarget.style.borderColor = 'var(--blue-deep)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="hidden md:inline">Cadastre sua escola</span>
            <span className="md:hidden">Cadastrar</span>
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              color: 'var(--ink)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,25,35,0.4)' }}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div
            className="absolute top-0 right-0 h-full flex flex-col"
            style={{
              width: 280,
              background: 'var(--bg)',
              borderLeft: '1px solid var(--border-2)',
              padding: '20px 24px',
            }}
          >
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
                aria-label="Fechar menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col" style={{ gap: 20 }}>
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="font-body"
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--ink)',
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
                    className="font-body"
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      textDecoration: 'none',
                    }}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
