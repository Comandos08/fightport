import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Award, Coins, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { to: '/painel', label: t('app.nav.dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/painel/praticantes', label: t('app.nav.practitioners'), icon: Users, exact: false },
    { to: '/painel/conquistas/nova', label: t('app.nav.newAchievement'), icon: Award, exact: true },
    { to: '/painel/creditos', label: t('app.nav.credits'), icon: Coins, exact: true },
    { to: '/painel/configuracoes', label: t('app.nav.settings'), icon: Settings, exact: true },
  ];

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 min-h-screen"
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
        <Link to="/" className="no-underline">
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)' }}>fightport.pro</span>
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
                fontWeight: active ? 400 : 300,
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
