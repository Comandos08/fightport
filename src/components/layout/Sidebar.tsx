import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Award, Coins, Settings, LifeBuoy, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import logoFightport from '@/assets/logo-fightport.png';

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

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
  const triggerPulse = () => {
    setPulse(true);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulse(false), 3000);
  };

  // Realtime global: atualiza badge + dispara toast sutil ao receber resposta do admin
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`sidebar-school-unread-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const msg = payload.new as { author_type?: string; ticket_id?: string };
          qc.invalidateQueries({ queryKey: ['school-unread-count'] });
          if (msg?.author_type !== 'admin') return;
          triggerPulse();
          // Não mostra toast quando o usuário já está na página de Suporte
          if (location.pathname.startsWith('/painel/suporte')) return;
          toast('Nova resposta do suporte', {
            description: 'Clique em "Abrir" para ver o ticket.',
            action: {
              label: 'Abrir',
              onClick: () => navigate('/painel/suporte'),
            },
          });
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
  }, [user?.id, qc, location.pathname, navigate]);


  const links = [
    { to: '/painel', label: t('app.nav.dashboard'), icon: LayoutDashboard, exact: true, badge: 0 },
    { to: '/painel/praticantes', label: t('app.nav.practitioners'), icon: Users, exact: false, badge: 0 },
    { to: '/painel/conquistas/nova', label: t('app.nav.newAchievement'), icon: Award, exact: true, badge: 0 },
    { to: '/painel/creditos', label: t('app.nav.credits'), icon: Coins, exact: true, badge: 0 },
    { to: '/painel/suporte', label: 'Suporte', icon: LifeBuoy, exact: false, badge: unread, badgeLabel: unread > 9 ? '9+' : undefined },
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
        {links.map(({ to, label, icon: Icon, exact, badge, badgeLabel }) => {
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
  );
}
