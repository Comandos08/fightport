import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school-suspended-check', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('schools')
        .select('is_suspended')
        .eq('id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (loading || (user && schoolLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main">
        <div className="animate-spin h-8 w-8 border-4 border-accent-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (school?.is_suspended === true) {
    const handleSignOut = async () => {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    };

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg, #FFFFFF)',
          padding: '32px',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <ShieldAlert size={48} color="#C0392B" strokeWidth={1.5} />
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: 28,
              color: 'var(--color-text, #0D0D0D)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Conta Suspensa
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--color-text-muted, #595959)',
              margin: 0,
            }}
          >
            Sua conta foi temporariamente suspensa pelo administrador. Entre em
            contato com o suporte para mais informações.
          </p>
          <button
            onClick={handleSignOut}
            style={{
              marginTop: 8,
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              fontSize: 14,
              padding: '10px 24px',
              background: 'var(--color-text, #0D0D0D)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm, 6px)',
              cursor: 'pointer',
              transition: 'var(--transition, all 0.2s ease)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
