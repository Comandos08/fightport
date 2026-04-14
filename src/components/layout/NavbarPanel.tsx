import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditBalance } from '@/components/CreditBalance';
import { User, LogOut, Menu, X, LayoutDashboard, Users, Award, Coins, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const links = [
  { to: '/painel', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/painel/praticantes', label: 'Praticantes', icon: Users, exact: false },
  { to: '/painel/conquistas/nova', label: 'Nova Conquista', icon: Award, exact: true },
  { to: '/painel/creditos', label: 'Créditos', icon: Coins, exact: true },
  { to: '/painel/configuracoes', label: 'Configurações', icon: Settings, exact: true },
];

export function NavbarPanel() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          borderBottom: '1px solid var(--border-2)',
          background: 'var(--white)',
        }}
      >
        <button
          className="lg:hidden mr-3 cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          style={{ color: 'var(--ink)' }}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden mr-3">
          <Link to="/" className="flex items-baseline">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>FIGHT</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>PORT</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--terra)' }}>.PRO</span>
          </Link>
        </div>

        {/* Credits left */}
        <div className="flex items-center" style={{ gap: 8 }}>
          <Coins style={{ width: 16, height: 16, color: 'var(--blue-deep)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>{balance}</span>
          {balance <= 2 && (
            <Link to="/painel/creditos" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'var(--terra)', textDecoration: 'none' }}>
              Comprar mais
            </Link>
          )}
        </div>

        <div className="flex-1" />

        {/* School name + logout */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ink)' }} className="hidden sm:block">
            {school?.name ?? '...'}
          </span>
          <button onClick={signOut} className="cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Sair">
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
            style={{ width: 280, background: 'var(--white)' }}
          >
            <div className="flex items-center justify-between" style={{ padding: '20px 20px', borderBottom: '1px solid var(--border-2)' }}>
              <Link to="/" className="flex items-baseline" onClick={() => setMobileOpen(false)}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>FIGHT</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>PORT</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--terra)' }}>.PRO</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="cursor-pointer" style={{ color: 'var(--muted)' }} aria-label="Fechar menu">
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
                      padding: '10px 20px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: 14,
                      color: active ? 'var(--blue-deep)' : 'var(--muted)',
                      background: active ? 'var(--blue-light)' : 'transparent',
                      borderLeft: active ? '3px solid var(--blue-deep)' : '3px solid transparent',
                      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      transition: 'var(--transition)',
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} />
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
