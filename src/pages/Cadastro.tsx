import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// ── Input style helpers ──
const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-soft)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '13px 16px',
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  color: 'var(--color-text)',
  outline: 'none',
  width: '100%',
  transition: 'var(--transition)',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = '#9A9A9A';
  e.currentTarget.style.background = '#FFFFFF';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--color-border)';
  e.currentTarget.style.background = 'var(--color-bg-soft)';
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.01em',
  color: 'var(--color-text)',
  display: 'block',
  marginBottom: 6,
};

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

export default function CadastroPage() {
  const location = useLocation();
  const [mode, setMode] = useState<'signup' | 'login'>(
    location.pathname === '/login' ? 'login' : 'signup'
  );
  const [animating, setAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [schoolName, setSchoolName] = useState('');
  const [coachName, setCoachName] = useState('');
  const [coachGraduation, setCoachGraduation] = useState('');
  const [martialArt, setMartialArt] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/painel/praticantes', { replace: true });
  }, [user, navigate]);

  // ── ALL LOGIC BELOW IS PRESERVED EXACTLY ──
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
    if (authError) { setLoading(false); toast.error(authError.message); return; }
    const userId = authData.user?.id;
    if (!userId) { setLoading(false); toast.error('Erro ao criar conta.'); return; }
    const { error: schoolError } = await supabase.from('schools').insert({ id: userId, name: schoolName, martial_art: martialArt, email });
    if (schoolError) console.error('School insert error:', schoolError);
    const { error: coachError } = await supabase.from('head_coaches').insert({ school_id: userId, name: coachName, graduation: coachGraduation });
    if (coachError) console.error('Coach insert error:', coachError);
    const { error: creditsError } = await supabase.from('credits').insert({ school_id: userId, balance: 0 });
    if (creditsError) console.error('Credits insert error:', creditsError);
    setLoading(false);
    setSuccess(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
    } else {
      navigate('/painel/praticantes');
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) { toast.error('Digite seu e-mail primeiro.'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: `${window.location.origin}/recuperar-senha`,
    });
    if (error) { toast.error(error.message); } else { toast.success('E-mail de recuperação enviado. Verifique sua caixa de entrada.'); }
  };

  const switchMode = (newMode: 'signup' | 'login') => {
    if (newMode === mode) return;
    setAnimating(true);
    setTimeout(() => {
      setMode(newMode);
      setShowPassword(false);
      setTimeout(() => setAnimating(false), 50);
    }, 150);
  };

  // ── SUCCESS STATE ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--color-bg-soft)' }}>
            <Shield className="h-8 w-8" style={{ color: 'var(--color-text)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: 8 }}>
            Conta criada!
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.65 }}>
            Enviamos um e-mail de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <button
            onClick={() => switchMode('login')}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 500,
              background: 'var(--color-bg-amber)',
              color: 'var(--color-text)',
              padding: '14px 28px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN RENDER ──
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT PANEL — Dark */}
      <div
        className="hidden md:flex flex-col justify-between"
        style={{ background: 'var(--color-bg-dark)', padding: '64px 52px' }}
      >
        {/* Top */}
        <div>
          <Link to="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, color: '#FFFFFF' }}>
            fightport<span style={{ color: 'var(--color-accent)' }}>.pro</span>
          </Link>

          <div style={{ marginTop: 64 }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
              PARA ORGANIZAÇÕES ESPORTIVAS
            </p>

            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 3.5vw, 48px)', lineHeight: 1.08, letterSpacing: '-0.025em', color: '#FFFFFF', marginBottom: 32 }}>
              Comece hoje.<br />
              Seu primeiro<br />
              cadastro é grátis.
            </h2>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
              Você só paga quando graduar um atleta.<br />
              Sem mensalidade. Sem surpresas.
            </p>

            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 40 }}>
              {[
                'Certificação com hash SHA-256 imutável',
                'QR Code verificável por qualquer pessoa',
                'Passaporte digital permanente por atleta',
                'Créditos nunca expiram — use quando quiser',
              ].map((text) => (
                <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'var(--color-bg-amber)', flexShrink: 0, marginTop: 2 }}>→</span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32, marginTop: 'auto' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
            "O fightport.pro trouxe credibilidade real para nossa organização."
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
            — Prof. Ricardo Almeida · Faixa Preta 5° Grau
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex flex-col justify-center cadastro-form-panel" style={{ background: 'var(--color-bg)', padding: '64px 72px' }}>
        <div className="w-full" style={{ maxWidth: 460, margin: '0 auto' }}>
          {/* Mobile logo */}
          <div className="md:hidden mb-8">
            <Link to="/" style={{ textDecoration: 'none', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, color: 'var(--color-text)' }}>
              fightport<span style={{ color: 'var(--color-accent)' }}>.pro</span>
            </Link>
          </div>

          {/* Title */}
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: 4 }}>
            {mode === 'signup' ? 'Criar conta gratuita' : 'Bem-vindo de volta'}
          </h2>

          {/* Switch row */}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32 }}>
            {mode === 'signup' ? (
              <>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)',
                    background: 'none', border: 'none', textDecoration: 'underline', textUnderlineOffset: '3px',
                    cursor: 'pointer', padding: 0, transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)',
                    background: 'none', border: 'none', textDecoration: 'underline', textUnderlineOffset: '3px',
                    cursor: 'pointer', padding: 0, transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                >
                  Cadastrar
                </button>
              </>
            )}
          </p>

          {/* FORM AREA with transition */}
          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(8px)' : 'translateY(0)',
              transition: 'opacity 150ms ease, transform 200ms ease',
            }}
          >
            {mode === 'signup' ? (
              <form
                onSubmit={handleSignup}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* School name */}
                <div>
                  <label style={labelStyle}>Nome da organização</label>
                  <input value={schoolName} onChange={e => setSchoolName(e.target.value)} required placeholder="Ex: Academia Tiger BJJ" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Coach + Martial art — 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Seu nome (Head Coach)</label>
                    <input value={coachName} onChange={e => setCoachName(e.target.value)} required placeholder="Nome completo" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                  </div>
                  <div>
                    <label style={labelStyle}>Arte marcial principal</label>
                    <select value={martialArt} onChange={e => setMartialArt(e.target.value)} required style={{ ...inputStyle, appearance: 'none', backgroundImage: selectChevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }} onFocus={focusInput as any} onBlur={blurInput as any}>
                      <option value="">Selecione</option>
                      <option>Jiu-Jitsu</option>
                      <option>Judo</option>
                      <option>Ju-Jitsu</option>
                      <option>Wrestling</option>
                      <option>Luta Livre</option>
                      <option>Sambo</option>
                      <option>Karate</option>
                      <option>Boxe</option>
                      <option>Kickboxing</option>
                      <option>Savate</option>
                      <option>Aikido</option>
                      <option>Kurash</option>
                      <option>Pankration</option>
                      <option>Kenpo</option>
                      <option>Muay Thai</option>
                      <option>MMA</option>
                      <option>Outros</option>
                    </select>
                  </div>
                </div>

                {/* Graduation */}
                <div>
                  <label style={labelStyle}>Graduação do Head Coach</label>
                  <select value={coachGraduation} onChange={e => setCoachGraduation(e.target.value)} required style={{ ...inputStyle, appearance: 'none', backgroundImage: selectChevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }} onFocus={focusInput as any} onBlur={blurInput as any}>
                    <option value="">Selecione</option>
                    <option>Faixa Branca</option>
                    <option>Faixa Azul</option>
                    <option>Faixa Roxa</option>
                    <option>Faixa Marrom</option>
                    <option>Faixa Preta</option>
                  </select>
                </div>

                {/* Spacer */}
                <div style={{ marginTop: 8, marginBottom: 8 }} />

                {/* Email */}
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="contato@email.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Senha</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Mínimo 8 caracteres"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)',
                        padding: 4, display: 'flex',
                      }}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15,
                    fontWeight: 500,
                    background: 'var(--color-bg-amber)',
                    color: 'var(--color-text)',
                    padding: '14px 28px',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#e09600'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-amber)'; }}
                >
                  {loading ? 'Criando conta...' : 'Criar conta gratuita'}
                </button>

                {/* Terms */}
                <p style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-light)', lineHeight: 1.6 }}>
                  Ao criar conta você concorda com os{' '}
                  <Link to="/termos" style={{ color: 'var(--color-text-light)', textDecoration: 'underline' }}>Termos de Uso</Link> e{' '}
                  <Link to="/privacidade" style={{ color: 'var(--color-text-light)', textDecoration: 'underline' }}>Política de Privacidade</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Email */}
                <div>
                  <label style={labelStyle}>E-mail</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="contato@email.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Senha</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      placeholder="Sua senha"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)',
                        padding: 4, display: 'flex',
                      }}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 8,
                    fontFamily: 'var(--font-sans)',
                    fontSize: 15,
                    fontWeight: 500,
                    background: 'var(--color-bg-amber)',
                    color: 'var(--color-text)',
                    padding: '14px 28px',
                    width: '100%',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#e09600'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-amber)'; }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>

                {/* Switch link */}
                <p style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--color-text)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                  >
                    Cadastrar →
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .cadastro-form-panel { padding: 48px 40px !important; }
        }
        @media (max-width: 768px) {
          .cadastro-form-panel { padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
