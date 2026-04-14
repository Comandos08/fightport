import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/painel/praticantes', { replace: true });
    } else {
      navigate('/cadastro', { replace: true, state: { mode: 'login' } });
    }
  }, [user, navigate]);

  return null;
}
