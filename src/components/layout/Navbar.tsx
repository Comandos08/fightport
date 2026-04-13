import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b"
      style={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(247,245,240,0.88)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 max-w-7xl">
        <Link to="/" className="flex items-baseline gap-0">
          <span className="font-display font-bold text-xl text-ink">fight</span>
          <span className="font-display font-normal text-xl text-ink">port</span>
          <span className="font-display font-bold text-xl text-accent-brand">.pro</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="/#busca" className="font-body text-sm text-ink-muted hover:text-ink transition-colors">
            Verificar atleta
          </a>
          <a href="/#como-funciona" className="font-body text-sm text-ink-muted hover:text-ink transition-colors">
            Como funciona
          </a>
          <Link to="/cadastro" className="font-body text-sm text-ink-muted hover:text-ink transition-colors">
            Para escolas
          </Link>
        </div>

        <Link to="/cadastro">
          <Button variant="default" size="sm">Cadastre sua escola</Button>
        </Link>
      </div>
    </nav>
  );
}
