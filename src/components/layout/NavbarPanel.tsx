import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, LayoutDashboard, Users, Award, Coins, Settings, LifeBuoy, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { formatBadgeCount } from '@/lib/badge';
import logoFightport from '@/assets/logo-fightport.png';
import { NotificationBell } from '@/components/NotificationBell';

export function NavbarPanel() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const qc = useQueryClient();
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
    if (!isHorizontalSwipe.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontalSwipe.current) return;
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

  const { data: unread = 0 } = useQuery({
    queryKey: ['school-unread-count', user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('school_unread_messages_count');
      return Number(data ?? 0);
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  // Tickets aguardando resposta da escola há mais de 24h
  const { data: staleTickets = 0 } = useQuery({
    queryKey: ['school-stale-tickets-count', user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('school_stale_tickets_count');
      return Number(data ?? 0);
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });

  // Pulso visual no badge ao chegar nova mensagem do admin
  const [pulse, setPulse] = useState(false);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Realtime global: badge de Suporte sempre atualizado + pulso ao receber resposta do admin
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`navbar-school-unread-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const msg = payload.new as { author_type?: string };
          qc.invalidateQueries({ queryKey: ['school-unread-count'] });
          if (msg?.author_type !== 'admin') return;
          setPulse(true);
          if (pulseTimer.current) clearTimeout(pulseTimer.current);
          pulseTimer.current = setTimeout(() => setPulse(false), 3000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_messages' },
        () => { qc.invalidateQueries({ queryKey: ['school-unread-count'] }); }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, [user?.id, qc]);

  const links = [
    { to: '/painel', label: t('app.nav.dashboard'), icon: LayoutDashboard, exact: true, badge: 0 },
    { to: '/painel/praticantes', label: t('app.nav.practitioners'), icon: Users, exact: false, badge: 0 },
    { to: '/painel/conquistas/nova', label: t('app.nav.newAchievement'), icon: Award, exact: true, badge: 0 },
    { to: '/painel/creditos', label: t('app.nav.credits'), icon: Coins, exact: true, badge: 0 },
    { to: '/painel/suporte', label: 'Suporte', icon: LifeBuoy, exact: false, badge: unread, badgeLabel: formatBadgeCount(unread) ?? undefined },
    { to: '/painel/configuracoes', label: t('app.nav.settings'), icon: Settings, exact: true, badge: 0 },
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
            style={{
              width: 280,
              background: 'var(--color-bg)',
              transform: dragOffset < 0 ? `translateX(${dragOffset}px)` : undefined,
              transition: dragOffset === 0 ? 'transform 200ms ease-out' : 'none',
              touchAction: 'pan-y',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Handle bar — sugere swipe-to-close */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 4,
                height: 40,
                borderRadius: 999,
                background: 'var(--color-border)',
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            />
            <div className="flex items-center justify-between" style={{ padding: '20px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <Link to="/" className="no-underline" onClick={() => setMobileOpen(false)}>
                <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)' }}>fightport.pro</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-1" style={{ padding: '8px 0' }}>
              {links.map(({ to, label, icon: Icon, exact, badge, badgeLabel }) => {
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
                    <span style={{ flex: 1 }}>{label}</span>
                    {to === '/painel/suporte' && staleTickets > 0 && (
                      <Clock
                        aria-label={`${staleTickets} ticket(s) aguardando sua resposta há mais de 24h`}
                        style={{ width: 12, height: 12, color: 'var(--color-bg-amber)', marginRight: 2 }}
                      />
                    )}
                    {badge > 0 && (
                      <span style={{ position: 'relative', display: 'inline-flex' }}>
                        <span style={{
                          fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600,
                          padding: '1px 6px', borderRadius: 999,
                          background: '#0D0D0D', color: '#C8F135', minWidth: 18, textAlign: 'center',
                        }}>
                          {badgeLabel ?? badge}
                        </span>
                        {to === '/painel/suporte' && pulse && (
                          <span
                            aria-hidden
                            className="animate-ping"
                            style={{
                              position: 'absolute', top: -2, right: -2,
                              width: 8, height: 8, borderRadius: 999,
                              background: '#C8F135',
                            }}
                          />
                        )}
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
