import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, LayoutDashboard, Users, Award, Coins, Settings, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import logoFightport from '@/assets/logo-fightport.png';
import { NotificationBell } from '@/components/NotificationBell';

export function NavbarPanel() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/painel', label: t('app.nav.dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/painel/praticantes', label: t('app.nav.practitioners'), icon: Users, exact: false },
    { to: '/painel/conquistas/nova', label: t('app.nav.newAchievement'), icon: Award, exact: true },
    { to: '/painel/creditos', label: t('app.nav.credits'), icon: Coins, exact: true },
    { to: '/painel/suporte', label: 'Suporte', icon: LifeBuoy, exact: false },
    { to: '/painel/configuracoes', label: t('app.nav.settings'), icon: Settings, exact: true },
  ];

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const { data: school } = useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('name').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('credits').select('balance').eq('school_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const balance = credits?.balance ?? 0;

  return (
    <>
      <header
        className="flex items-center shrink-0"
        style={{
          height: 56,
          padding: '0 32px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        <button
          className="lg:hidden mr-3 cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label={t('app.nav.dashboard')}
          style={{ color: 'var(--color-text)', background: 'none', border: 'none' }}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden mr-3">
          <Link to="/" className="flex items-center">
            <img src={logoFightport} alt="Fightport" style={{ height: 20 }} />
          </Link>
        </div>

        {/* Credits left */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)' }}>{balance} {t('pricing.credits')}</span>
          {balance <= 2 && (
            <Link to="/painel/creditos" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: 'var(--color-bg-amber)', textDecoration: 'none' }}>
              {t('dashboard.buyMore')}
            </Link>
          )}
        </div>

        <div className="flex-1" />

        {/* School name + logout */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <NotificationBell />
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 14, color: 'var(--color-text-muted)' }} className="hidden sm:block">
            {school?.name ?? '...'}
          </span>
          <button onClick={signOut} className="cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }} aria-label={t('app.nav.logout')}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(15,25,35,0.4)' }} onClick={() => setMobileOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col animate-in slide-in-from-left duration-200"
            style={{ width: 280, background: 'var(--color-bg)' }}
          >
            <div className="flex items-center justify-between" style={{ padding: '20px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <Link to="/" className="no-underline" onClick={() => setMobileOpen(false)}>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)' }}>fightport.pro</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1" style={{ padding: '8px 0' }}>
              {links.map(({ to, label, icon: Icon, exact }) => {
                const active = isActive(to, exact);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center no-underline"
                    style={{
                      gap: 10,
                      padding: '9px 20px',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: active ? 500 : 400,
                      fontSize: 14,
                      color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                      background: active ? 'var(--color-bg-soft)' : 'transparent',
                      borderLeft: active ? '2px solid var(--color-text)' : '2px solid transparent',
                      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      transition: 'var(--transition)',
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
