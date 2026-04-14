import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Award, Coins, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/painel', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/painel/praticantes', label: 'Praticantes', icon: Users, exact: false },
  { to: '/painel/conquistas/nova', label: 'Nova Conquista', icon: Award, exact: true },
  { to: '/painel/creditos', label: 'Créditos', icon: Coins, exact: true },
  { to: '/painel/configuracoes', label: 'Configurações', icon: Settings, exact: true },
];

export function Sidebar() {
  const location = useLocation();

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r bg-main shrink-0 min-h-screen" style={{ borderColor: 'var(--color-border)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Link to="/" className="flex items-baseline">
          <span className="font-display font-bold text-[18px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
          <span className="font-display font-normal text-[18px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
          <span className="font-display font-bold text-[18px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors',
              isActive(to, exact) ? 'bg-surface text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-surface'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
