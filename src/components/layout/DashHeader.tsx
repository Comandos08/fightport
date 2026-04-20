import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogOut, Menu, X,
  LayoutDashboard, Building2, Users, Award, DollarSign, LifeBuoy, ScrollText,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { NotificationBell } from '@/components/NotificationBell';
import logoFightport from '@/assets/logo-fightport.png';

const links = [
  { to: '/dash', label: 'Dashboard', icon: LayoutDashboard, exact: true, key: 'dash' },
  { to: '/dash/organizacoes', label: 'Organizações', icon: Building2, exact: false, key: 'org' },
  { to: '/dash/atletas', label: 'Atletas', icon: Users, exact: false, key: 'ath' },
  { to: '/dash/graduacoes', label: 'Graduações', icon: Award, exact: false, key: 'grad' },
  { to: '/dash/financeiro', label: 'Financeiro', icon: DollarSign, exact: false, key: 'fin' },
  { to: '/dash/suporte', label: 'Suporte', icon: LifeBuoy, exact: false, key: 'sup' },
  { to: '/dash/auditoria', label: 'Auditoria', icon: ScrollText, exact: false, key: 'aud' },
];

export function DashHeader() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determina direção dominante na primeira movimentação relevante
    if (!isHorizontalSwipe.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontalSwipe.current) return;

    // Apenas swipe à esquerda (dx negativo) move o drawer
    if (dx < 0) setDragOffset(dx);
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && dragOffset < -70) {
      setMobileOpen(false);
    }
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
  };

  const { data: school } = useQuery({
    queryKey: ['school-admin-name', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('name,is_admin').eq('id', user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: awaiting = 0 } = useQuery({
    queryKey: ['admin-awaiting-count'],
    queryFn: async () => {
      const { data } = await supabase.rpc('admin_awaiting_admin_count');
      return Number(data ?? 0);
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <header
        className="flex items-center shrink-0 px-4 lg:px-8"
        style={{
          height: 56,
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg)',
        }}
      >
        {/* Hamburger mobile */}
        <button
          className="lg:hidden mr-3 cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          style={{ color: 'var(--color-text)', background: 'none', border: 'none' }}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden mr-3">
          <Link to="/" className="flex items-center" style={{ gap: 6 }}>
            <img src={logoFightport} alt="Fightport" style={{ height: 18 }} />
            <span
              style={{
                fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600,
                letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4,
                background: '#D8421A', color: '#FFFFFF', textTransform: 'uppercase',
              }}
            >
              Admin
            </span>
          </Link>
        </div>

        <div className="flex-1" />
        <div className="flex items-center" style={{ gap: 12 }}>
          <NotificationBell />
          {school?.is_admin && (
            <span
              className="hidden sm:inline-block"
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: '0.05em',
                color: '#FFFFFF',
                background: '#D8421A',
                padding: '2px 8px',
                borderRadius: 4,
                border: '1px solid rgba(216, 66, 26, 0.3)',
              }}
            >
              ADMIN
            </span>
          )}
          <span
            className="hidden sm:block"
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 14,
              color: 'var(--color-text-muted)',
            }}
          >
            {school?.name ?? user?.email ?? '...'}
          </span>
          <button
            onClick={signOut}
            className="cursor-pointer"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,25,35,0.4)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 flex flex-col animate-in slide-in-from-left duration-200"
            style={{ width: 280, background: 'var(--color-bg)' }}
          >
            <div
              className="flex items-center justify-between"
              style={{ padding: '20px 20px', borderBottom: '1px solid var(--color-border)' }}
            >
              <Link to="/" className="flex items-center no-underline" style={{ gap: 8 }} onClick={() => setMobileOpen(false)}>
                <img src={logoFightport} alt="Fightport" style={{ height: 20 }} />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600,
                    letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 4,
                    background: '#D8421A', color: '#FFFFFF', textTransform: 'uppercase',
                  }}
                >
                  Admin
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer"
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1" style={{ padding: '8px 0' }}>
              {links.map(({ to, label, icon: Icon, exact, key }) => {
                const active = isActive(to, exact);
                const badge = key === 'sup' ? awaiting : 0;
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
                      fontWeight: active ? 500 : 300,
                      fontSize: 14,
                      color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
                      background: active ? 'var(--color-bg-soft)' : 'transparent',
                      borderLeft: active ? '2px solid var(--color-text)' : '2px solid transparent',
                      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      transition: 'var(--transition)',
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
        </div>
      )}
    </>
  );
}
