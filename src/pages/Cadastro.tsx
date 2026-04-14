import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// ── Input style helpers ──
const inputStyle: React.CSSProperties = {
  background: 'var(--white)',
  border: '1.5px solid var(--border-2)',
  borderRadius: 'var(--radius-sm)',
  padding: '11px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  width: '100%',
  transition: 'var(--transition)',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--blue-mid)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88,131,154,0.15)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'var(--border-2)';
  e.currentTarget.style.boxShadow = 'none';
};

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
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--blue-light)' }}>
            <Shield className="h-8 w-8" style={{ color: 'var(--blue-deep)' }} />
          </div>
          <h1 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            Conta criada!
          </h1>
          <p className="font-body text-sm mb-6" style={{ color: 'var(--muted)' }}>
            Enviamos um e-mail de confirmação para <strong>{email}</strong>. Clique no link para ativar sua conta.
          </p>
          <button
            onClick={() => switchMode('login')}
            className="font-display"
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background: 'var(--blue-deep)',
              color: '#fff',
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
      {/* LEFT PANEL */}
      <div
        className="relative overflow-hidden hidden md:flex flex-col justify-between"
        style={{ background: 'var(--blue-deep)', padding: '56px 52px' }}
      >
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -80, right: -60, width: 260, height: 260,
            borderRadius: '50%', background: 'rgba(216,66,26,0.15)', filter: 'blur(50px)',
          }}
        />

        {/* Top */}
        <div>
          <Link to="/" className="flex items-baseline" style={{ textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>FIGHT PORT</span>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--terra)' }}>.PRO</span>
          </Link>

          <h2
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(38px, 4vw, 54px)',
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              color: '#fff',
              marginTop: 56,
            }}
          >
            COMECE<br />HOJE,<br /><span style={{ color: 'var(--terra)' }}>GRÁTIS.</span>
          </h2>

          <p className="font-body" style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: 12, marginBottom: 40 }}>
            Seu primeiro cadastro não custa nada.
          </p>

          {/* Benefits */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 44 }}>
            {[
              { emoji: '🔒', text: 'Certificação com hash SHA-256 imutável' },
              { emoji: '⬛', text: 'QR Code verificável por qualquer pessoa' },
              { emoji: '🎖', text: 'Passaporte digital permanente por atleta' },
              { emoji: '🔄', text: 'Créditos nunca expiram — use quando quiser' },
            ].map((b) => (
              <li key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 30, height: 30,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, flexShrink: 0,
                  }}
                >
                  {b.emoji}
                </div>
                <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.70)' }}>
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: '3px solid var(--terra)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            padding: '20px 22px',
          }}
        >
          <p className="font-body" style={{ fontSize: 13, fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            "O fightport.pro trouxe credibilidade e profissionalismo para a nossa academia. Os pais dos alunos adoram."
          </p>
          <p className="font-display" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terra-soft)', marginTop: 12 }}>
            — Prof. Ricardo Almeida · Faixa Preta 5° Grau
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center" style={{ background: 'var(--bg)', padding: '56px 60px' }}>
        <div className="w-full" style={{ maxWidth: 460, margin: '0 auto' }}>
          {/* Mobile logo */}
          <div className="md:hidden mb-8">
            <Link to="/" className="flex items-baseline" style={{ textDecoration: 'none' }}>
              <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>FIGHT PORT</span>
              <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--terra)' }}>.PRO</span>
            </Link>
          </div>

          {/* Title */}
          <h2
            className="font-display"
            style={{
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '-0.02em',
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          >
            {mode === 'signup' ? 'CRIAR CONTA GRATUITA' : 'BEM-VINDO DE VOLTA'}
          </h2>

          {/* Switch row */}
          <p className="font-body" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
            {mode === 'signup' ? (
              <>
                Já tem uma conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-body"
                  style={{
                    fontSize: 13, fontWeight: 700, color: 'var(--blue-deep)',
                    background: 'none', border: 'none', borderBottom: '1.5px solid var(--blue-light)',
                    cursor: 'pointer', padding: 0, transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--terra)'; e.currentTarget.style.borderColor = 'var(--terra)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--blue-deep)'; e.currentTarget.style.borderColor = 'var(--blue-light)'; }}
                >
                  Entrar →
                </button>
              </>
            ) : (
              <>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-body"
                  style={{
                    fontSize: 13, fontWeight: 700, color: 'var(--blue-deep)',
                    background: 'none', border: 'none', borderBottom: '1.5px solid var(--blue-light)',
                    cursor: 'pointer', padding: 0, transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--terra)'; e.currentTarget.style.borderColor = 'var(--terra)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--blue-deep)'; e.currentTarget.style.borderColor = 'var(--blue-light)'; }}
                >
                  Criar conta grátis →
                </button>
              </>
            )}
          </p>

          {/* FORM AREA with transition */}
          <div
            style={{
              opacity: animating ? 0 : 1,
              transform: animating ? 'translateY(-8px)' : 'translateY(0)',
              transition: 'opacity 150ms ease, transform 150ms ease',
            }}
          >
            {mode === 'signup' ? (
              <form
                onSubmit={handleSignup}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
              >
                {/* School name — full */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Nome da academia</label>
                  <input value={schoolName} onChange={e => setSchoolName(e.target.value)} required placeholder="Ex: Academia Tiger BJJ" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Coach name — half */}
                <div>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Seu nome (Head Coach)</label>
                  <input value={coachName} onChange={e => setCoachName(e.target.value)} required placeholder="Nome completo" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Martial art — half */}
                <div>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Arte marcial principal</label>
                  <select value={martialArt} onChange={e => setMartialArt(e.target.value)} required style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7580' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }} onFocus={focusInput as any} onBlur={blurInput as any}>
                    <option value="">Selecione</option>
                    <option>Jiu-Jitsu</option>
                    <option>Judô</option>
                    <option>Muay Thai</option>
                    <option>MMA</option>
                    <option>Karatê</option>
                    <option>Outra</option>
                  </select>
                </div>

                {/* Graduation — full */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Graduação do Head Coach</label>
                  <select value={coachGraduation} onChange={e => setCoachGraduation(e.target.value)} required style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7580' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }} onFocus={focusInput as any} onBlur={blurInput as any}>
                    <option value="">Selecione</option>
                    <option>Faixa Branca</option>
                    <option>Faixa Azul</option>
                    <option>Faixa Roxa</option>
                    <option>Faixa Marrom</option>
                    <option>Faixa Preta</option>
                  </select>
                </div>

                {/* Divider */}
                <div style={{ gridColumn: '1 / -1', height: 1, background: 'var(--border-2)', margin: '4px 0' }} />

                {/* Email — full */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="academia@email.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Password — full */}
                <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Senha</label>
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
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cloud)',
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
                  className="font-display"
                  style={{
                    gridColumn: '1 / -1',
                    marginTop: 6,
                    background: 'var(--blue-deep)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '15px 28px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'var(--blue-mid)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-btn)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--blue-deep)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {loading ? 'Criando conta...' : 'Criar conta gratuita'}
                </button>

                {/* Terms */}
                <p className="font-body" style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
                  Ao criar conta você concorda com os{' '}
                  <Link to="/termos" style={{ color: 'var(--blue-mid)', textDecoration: 'underline' }}>Termos de Uso</Link> e{' '}
                  <Link to="/privacidade" style={{ color: 'var(--blue-mid)', textDecoration: 'underline' }}>Política de Privacidade</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Email */}
                <div>
                  <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>E-mail</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="academia@email.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="font-body" style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Senha</label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-body"
                      style={{ fontSize: 12, color: 'var(--blue-mid)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cloud)',
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
                  className="font-display"
                  style={{
                    marginTop: 6,
                    background: 'var(--blue-deep)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '15px 28px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'var(--blue-mid)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-btn)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--blue-deep)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {loading ? 'Entrando...' : 'Entrar na minha academia'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
