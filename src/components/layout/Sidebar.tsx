import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Award, Coins, Settings } from 'lucide-react';

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
    <aside
      className="hidden lg:flex flex-col shrink-0 min-h-screen"
      style={{
        width: 240,
        background: 'var(--white)',
        borderRight: '1px solid var(--border-2)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 30,
      }}
    >
      <div style={{ padding: 24 }}>
        <Link to="/" className="flex items-baseline">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>FIGHT</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>PORT</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--terra)' }}>.PRO</span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1" style={{ padding: '8px 0' }}>
        {links.map(({ to, label, icon: Icon, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              className="flex items-center no-underline"
              style={{
                gap: 10,
                padding: '10px 20px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 14,
                color: active ? 'var(--blue-deep)' : 'var(--muted)',
                background: active ? 'var(--blue-light)' : 'transparent',
                borderLeft: active ? '3px solid var(--blue-deep)' : '3px solid transparent',
                borderRadius: active ? '0 var(--radius-sm) var(--radius-sm) 0' : '0 var(--radius-sm) var(--radius-sm) 0',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--muted)';
                }
              }}
            >
              <Icon style={{ width: 18, height: 18 }} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
