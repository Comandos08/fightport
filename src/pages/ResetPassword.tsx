import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) setIsRecovery(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') setIsRecovery(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error(t('resetPassword.minLength')); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); } else { toast.success(t('resetPassword.success')); navigate('/painel'); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', height: 48, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)', outline: 'none', transition: 'var(--transition)' };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)', padding: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('resetPassword.invalidLink')}</p>
          <Link to="/login"><Button>{t('resetPassword.backToLogin')}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 24, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 24 }}>{t('resetPassword.title')}</h1>
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>{t('resetPassword.label')}</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={{ ...inputStyle, paddingRight: 48 }} placeholder={t('resetPassword.placeholder')}
                onFocus={e => { e.currentTarget.style.borderColor = '#9A9A9A'; e.currentTarget.style.background = '#FFFFFF'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 cursor-pointer" style={{ right: 16, background: 'none', border: 'none', color: 'var(--color-text-muted)' }}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="cursor-pointer" style={{ width: '100%', padding: '14px 28px', background: 'var(--color-bg-amber)', color: '#1C1C1C', border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, transition: 'var(--transition)' }}>
            {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
