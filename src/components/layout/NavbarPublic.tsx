import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NavbarPublic() {
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
          <span className="font-display font-bold text-[18px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
          <span className="font-display font-normal text-[18px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
          <span className="font-display font-bold text-[18px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
        </Link>
        <Link to="/#busca">
          <Button variant="ghost" size="sm">Verificar outro atleta</Button>
        </Link>
      </div>
    </nav>
  );
}
