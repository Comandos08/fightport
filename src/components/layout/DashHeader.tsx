import { LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function DashHeader() {
  const { user, signOut } = useAuth();

  const { data: school } = useQuery({
    queryKey: ['school-admin-name', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('name').eq('id', user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        height: 56,
        padding: '0 32px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
      }}
    >
      <div className="flex-1" />
      <div className="flex items-center" style={{ gap: 12 }}>
        <span
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
  );
}
