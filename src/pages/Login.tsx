import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/cadastro', { replace: true, state: { mode: 'login' } });
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('schools')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data?.is_admin) {
        navigate('/dash', { replace: true });
      } else {
        navigate('/painel/praticantes', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate]);

  return null;
}
