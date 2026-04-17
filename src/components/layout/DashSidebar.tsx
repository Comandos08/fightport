import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Award, DollarSign, LifeBuoy, ScrollText } from 'lucide-react';
import logoFightport from '@/assets/logo-fightport.png';

const links = [
  { to: '/dash', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/dash/organizacoes', label: 'Organizações', icon: Building2, exact: false },
  { to: '/dash/atletas', label: 'Atletas', icon: Users, exact: false },
  { to: '/dash/graduacoes', label: 'Graduações', icon: Award, exact: false },
  { to: '/dash/financeiro', label: 'Financeiro', icon: DollarSign, exact: false },
  { to: '/dash/suporte', label: 'Suporte', icon: LifeBuoy, exact: false },
  { to: '/dash/auditoria', label: 'Auditoria', icon: ScrollText, exact: false },
];

export function DashSidebar() {
  const location = useLocation();

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0"
      style={{
        width: 240,
        background: 'var(--color-bg)',
        borderRight: '1px solid var(--color-border)',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 30,
      }}
    >
      <div style={{ padding: '24px 20px' }}>
        <Link to="/" className="flex items-center" style={{ gap: 8 }}>
          <img src={logoFightport} alt="Fightport" style={{ height: 20 }} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              textTransform: 'uppercase',
            }}
          >
            Admin
          </span>
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
                padding: '9px 20px',
                fontFamily: 'var(--font-sans)',
                fontWeight: active ? 500 : 300,
                fontSize: 14,
                color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                background: active ? 'var(--color-bg-soft)' : 'transparent',
                borderLeft: active ? '2px solid var(--color-text)' : '2px solid transparent',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-soft)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                }
              }}
            >
              <Icon style={{ width: 16, height: 16 }} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
