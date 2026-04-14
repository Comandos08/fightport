import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function VerificarRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/#busca', { replace: true });
  }, [navigate]);
  return null;
}
