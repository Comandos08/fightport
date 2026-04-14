import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, Award, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [coachName, setCoachName] = useState('');
  const [coachGraduation, setCoachGraduation] = useState('');
  const [martialArt, setMartialArt] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !coachName || !coachGraduation || !martialArt || !email || !password) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          school_name: schoolName,
          coach_name: coachName,
          coach_graduation: coachGraduation,
          martial_art: martialArt,
        },
      },
    });

    if (authError) {
      setLoading(false);
      toast.error(authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setLoading(false);
      toast.error('Erro ao criar conta.');
      return;
    }

    // 2. Create school record (using service role via RLS — school_id = auth.uid())
    const { error: schoolError } = await supabase.from('schools').insert({
      id: userId,
      name: schoolName,
      martial_art: martialArt,
      email,
    });

    if (schoolError) {
      console.error('School insert error:', schoolError);
    }

    // 3. Create head coach
    const { error: coachError } = await supabase.from('head_coaches').insert({
      school_id: userId,
      name: coachName,
      graduation: coachGraduation,
    });

    if (coachError) {
      console.error('Coach insert error:', coachError);
    }

    // 4. Initialize credits with 0
    const { error: creditsError } = await supabase.from('credits').insert({
      school_id: userId,
      balance: 0,
    });

    if (creditsError) {
      console.error('Credits insert error:', creditsError);
    }

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-verified flex items-center justify-center">
            <Shield className="h-8 w-8" style={{ color: 'var(--color-verified)' }} />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink mb-2" style={{ letterSpacing: '0.02em' }}>
            Conta criada!
          </h1>
          <p className="font-body text-sm text-ink-muted mb-6">
            Enviamos um e-mail de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <Link to="/login">
            <Button>Ir para o login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left */}
      <div className="lg:w-1/2 bg-dark p-8 lg:p-16 flex flex-col justify-center text-center lg:text-left">
        <Link to="/" className="flex items-baseline mb-12 justify-center lg:justify-start">
          <span className="font-display font-bold text-[20px]" style={{ color: '#fff', letterSpacing: '0.05em' }}>FIGHT</span>
          <span className="font-display font-normal text-[20px]" style={{ color: '#fff', letterSpacing: '0.05em' }}>PORT</span>
          <span className="font-display font-bold text-[20px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
        </Link>
        <h1 className="font-display font-bold text-3xl lg:text-4xl leading-tight mb-2" style={{ color: '#fff', letterSpacing: '-0.02em' }}>
          COMECE HOJE,
        </h1>
        <p className="font-body text-lg mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
          seu primeiro cadastro é grátis.
        </p>
        <ul className="space-y-4 mb-10">
          {[
            { icon: Shield, text: 'Certificação digital com hash SHA-256' },
            { icon: QrCode, text: 'QR Code verificável por qualquer pessoa' },
            { icon: Award, text: 'Passaporte digital para cada atleta' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 justify-center lg:justify-start">
              <Icon className="h-5 w-5 text-accent-brand shrink-0" />
              <span className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{text}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl p-5 border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="font-body text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
            "O fightport.pro trouxe credibilidade e profissionalismo para a nossa academia. Os pais dos alunos adoram."
          </p>
          <p className="font-body text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            — Prof. Ricardo Almeida, Faixa Preta 5° Grau
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="lg:w-1/2 bg-main p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="font-display font-bold text-xl text-ink mb-8" style={{ letterSpacing: '0.02em' }}>Criar conta gratuita</h2>
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da escola</label>
              <input value={schoolName} onChange={e => setSchoolName(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Ex: Academia Tiger BJJ" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Seu nome (Head Coach)</label>
              <input value={coachName} onChange={e => setCoachName(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Nome completo" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Graduação do Head Coach</label>
              <select value={coachGraduation} onChange={e => setCoachGraduation(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">Selecione</option>
                <option>Faixa Preta 1° Grau</option>
                <option>Faixa Preta 2° Grau</option>
                <option>Faixa Preta 3° Grau</option>
                <option>Faixa Preta 4° Grau</option>
                <option>Faixa Preta 5° Grau</option>
                <option>Faixa Preta 6° Grau</option>
                <option>Faixa Preta 7° Grau</option>
              </select>
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Arte marcial principal</label>
              <select value={martialArt} onChange={e => setMartialArt(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">Selecione</option>
                <option>Jiu-Jitsu</option>
                <option>Judô</option>
                <option>Karatê</option>
                <option>Muay Thai</option>
                <option>Boxe</option>
                <option>Outra</option>
              </select>
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="escola@email.com" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full h-12 px-4 pr-12 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Mínimo 8 caracteres" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors cursor-pointer" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta gratuita'}
            </Button>
          </form>
          <p className="mt-4 text-center">
            <Link to="/login" className="font-body text-sm text-ink-muted hover:text-ink transition-colors">
              Já tenho conta → Entrar
            </Link>
          </p>
          <p className="mt-4 text-center font-body text-xs text-ink-faint">
            Ao criar conta você concorda com os{' '}
            <Link to="/termos" className="underline">Termos de Uso</Link> e{' '}
            <Link to="/privacidade" className="underline">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
