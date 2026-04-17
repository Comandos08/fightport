import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import NotFound from '@/pages/NotFound';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  const { data: school, isLoading: schoolLoading } = useQuery({
    queryKey: ['school-admin-check', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('schools')
        .select('is_admin')
        .eq('id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  if (loading || (user && schoolLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: 'var(--color-text)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!school?.is_admin) {
    return <NotFound />;
  }

  return <>{children}</>;
}
