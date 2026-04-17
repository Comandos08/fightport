import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Award, Coins, Settings, LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import logoFightport from '@/assets/logo-fightport.png';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const { data: unread = 0 } = useQuery({
    queryKey: ['school-unread-count', user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('school_unread_messages_count');
      return Number(data ?? 0);
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  const links = [
    { to: '/painel', label: t('app.nav.dashboard'), icon: LayoutDashboard, exact: true, badge: 0 },
    { to: '/painel/praticantes', label: t('app.nav.practitioners'), icon: Users, exact: false, badge: 0 },
    { to: '/painel/conquistas/nova', label: t('app.nav.newAchievement'), icon: Award, exact: true, badge: 0 },
    { to: '/painel/creditos', label: t('app.nav.credits'), icon: Coins, exact: true, badge: 0 },
    { to: '/painel/suporte', label: 'Suporte', icon: LifeBuoy, exact: false, badge: unread },
    { to: '/painel/configuracoes', label: t('app.nav.settings'), icon: Settings, exact: true, badge: 0 },
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
        <Link to="/" className="flex items-center">
          <img src={logoFightport} alt="Fightport" style={{ height: 20 }} />
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1" style={{ padding: '8px 0' }}>
        {links.map(({ to, label, icon: Icon, exact, badge }) => {
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
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600,
                  padding: '1px 6px', borderRadius: 999,
                  background: '#0D0D0D', color: '#C8F135', minWidth: 18, textAlign: 'center',
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
