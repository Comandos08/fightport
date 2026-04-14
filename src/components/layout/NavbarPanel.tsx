import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditBalance } from '@/components/CreditBalance';
import { User, LogOut, Menu, X, LayoutDashboard, Users, Award, Coins, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

  return (
    <>
      <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-main shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <button
          className="lg:hidden mr-3 text-ink hover:text-ink-muted transition-colors cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden mr-3">
          <Link to="/" className="flex items-baseline">
            <span className="font-display font-bold text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
            <span className="font-display font-normal text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
            <span className="font-display font-bold text-[16px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
          </Link>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <CreditBalance balance={credits?.balance ?? 0} compact />
          <div className="h-8 w-px bg-surface" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
              <User className="h-4 w-4 text-ink-muted" />
            </div>
            <span className="hidden sm:block font-body text-sm text-ink">{school?.name ?? '...'}</span>
          </div>
          <button onClick={signOut} className="text-ink-faint hover:text-ink transition-colors cursor-pointer" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-main shadow-card flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <Link to="/" className="flex items-baseline" onClick={() => setMobileOpen(false)}>
                <span className="font-display font-bold text-[18px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
                <span className="font-display font-normal text-[18px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
                <span className="font-display font-bold text-[18px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-ink-muted hover:text-ink transition-colors cursor-pointer" aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 flex flex-col gap-1">
              {links.map(({ to, label, icon: Icon, exact }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
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
        </div>
      )}
    </>
  );
}
