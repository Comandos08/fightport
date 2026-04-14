import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/painel/praticantes', { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : error.message);
    } else {
      navigate('/painel/praticantes');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Digite seu e-mail primeiro.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('E-mail de recuperação enviado. Verifique sua caixa de entrada.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left */}
      <div className="lg:w-1/2 bg-dark p-8 lg:p-16 flex flex-col justify-center items-center lg:items-start">
        <Link to="/" className="flex items-baseline mb-12">
          <span className="font-display font-bold text-[20px]" style={{ color: '#fff', letterSpacing: '0.05em' }}>FIGHT</span>
          <span className="font-display font-normal text-[20px]" style={{ color: '#fff', letterSpacing: '0.05em' }}>PORT</span>
          <span className="font-display font-bold text-[20px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
        </Link>
        <h1 className="font-display font-bold text-3xl lg:text-4xl leading-tight mb-4 text-center lg:text-left" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
          O PASSAPORTE<br />DO SEU ATLETA.
        </h1>
        <p className="font-body text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Registre. Autentique. Certifique.
        </p>
      </div>

      {/* Right */}
      <div className="lg:w-1/2 bg-main p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="font-display font-bold text-xl text-ink mb-8" style={{ letterSpacing: '0.02em' }}>Entrar</h2>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="escola@email.com" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full h-12 px-4 pr-12 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Sua senha" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors cursor-pointer" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 flex flex-col items-center gap-2">
            <button onClick={handleForgotPassword} className="font-body text-sm text-ink-muted hover:text-ink transition-colors cursor-pointer bg-transparent border-none">
              Esqueci minha senha
            </button>
            <Link to="/cadastro" className="font-body text-sm text-accent-brand hover:underline transition-colors">
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
