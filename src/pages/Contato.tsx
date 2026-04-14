import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Building2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { FooterSection } from '@/components/home/FooterSection';
import { useSeo } from '@/hooks/useSeo';
import { useTranslation } from 'react-i18next';

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
  padding: '13px 16px', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)',
  outline: 'none', width: '100%', transition: 'var(--transition)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, letterSpacing: '0.01em',
  color: 'var(--color-text)', display: 'block', marginBottom: 6,
};

const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--color-bg-amber)';
  e.currentTarget.style.background = '#FFFFFF';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.1)';
};

const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--color-border)';
  e.currentTarget.style.background = 'var(--color-bg-soft)';
  e.currentTarget.style.boxShadow = 'none';
};

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

const cardIcons = [Mail, Building2, Shield];

export default function Contato() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useSeo({
    title: `${t('contact.hero')} — fightport.pro`,
    description: t('contact.subtitle'),
  });

  const subjects = t('contact.form.subjects', { returnObjects: true }) as string[];
  const cardKeys = ['support', 'orgs', 'privacy'] as const;

  const isValid = name.trim() && email.trim() && subject && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <section style={{ background: 'var(--color-text)', padding: '80px 0 60px', textAlign: 'center' }}>
        <div className="fp-container">
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: '#FFFFFF', maxWidth: 460, margin: '0 auto', marginBottom: 12 }}>
            {t('contact.hero')}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            {t('contact.heroSub')}
          </p>
        </div>
      </section>

      <section style={{ flex: 1, background: '#FFFFFF', padding: '48px 0 80px' }}>
        <div className="fp-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: 48, transition: 'var(--transition)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
            {t('contact.backLink')}
          </Link>

          <div style={{ display: 'grid', gap: 56 }} className="grid-cols-1 md:grid-cols-[2fr_3fr]">
            <div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '-0.02em' }}>
                {t('contact.title')}
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-muted)', marginBottom: 32 }}>
                {t('contact.subtitle')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {cardKeys.map((key, i) => {
                  const Icon = cardIcons[i];
                  return (
                    <div key={key} style={{ background: 'var(--color-text)', borderRadius: 'var(--radius-sm)', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <Icon size={20} style={{ color: 'var(--color-bg-amber)', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                          {t(`contact.cards.${key}.title`)}
                        </p>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                          {t(`contact.cards.${key}.desc`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginTop: 24, lineHeight: 1.6 }}>
                {t('contact.emailNote')}
              </p>
            </div>

            <div>
              {submitted ? (
                <div style={{ background: 'var(--color-bg-soft)', borderRadius: 'var(--radius-sm)', padding: '48px 32px', textAlign: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>
                    {t('contact.success.title')}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
                    {t('contact.success.desc')}
                  </p>
                  <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-bg-amber)', textDecoration: 'none' }}>
                    {t('contact.success.back')}
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={labelStyle}>{t('contact.form.name')} <span style={{ color: 'var(--color-bg-amber)' }}>*</span></label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required maxLength={100} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.form.email')} <span style={{ color: 'var(--color-bg-amber)' }}>*</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required maxLength={255} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.form.org')}</label>
                    <input type="text" value={org} onChange={e => setOrg(e.target.value)} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} maxLength={100} />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.form.subject')} <span style={{ color: 'var(--color-bg-amber)' }}>*</span></label>
                    <select value={subject} onChange={e => setSubject(e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', backgroundImage: selectChevron, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40, cursor: 'pointer', color: subject ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                      onFocus={focusStyle} onBlur={blurStyle} required>
                      <option value="" disabled>{t('contact.form.subjectPlaceholder')}</option>
                      {subjects.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>{t('contact.form.message')} <span style={{ color: 'var(--color-bg-amber)' }}>*</span></label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                      placeholder={t('contact.form.messagePlaceholder')}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                      onFocus={focusStyle as any} onBlur={blurStyle as any} required maxLength={2000} />
                  </div>
                  <button type="submit" disabled={!isValid}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: isValid ? '#000000' : 'rgba(0,0,0,0.4)', background: isValid ? 'var(--color-bg-amber)' : 'rgba(245,166,35,0.4)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '14px 24px', cursor: isValid ? 'pointer' : 'not-allowed', transition: 'var(--transition)', width: '100%' }}
                    onMouseEnter={e => { if (isValid) e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                    {t('contact.form.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
