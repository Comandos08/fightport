import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoFightport from '@/assets/logo-fightport.png';

const linkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 300,
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
  transition: 'var(--transition)',
  marginBottom: 10,
};

export function FooterSection() {
  const { t } = useTranslation();

  return (
    <footer style={{ background: 'var(--color-bg-dark)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="fp-container" style={{ padding: '48px 0 32px' }}>
        <div className="section-inner flex flex-col md:flex-row md:justify-between md:items-start" style={{ gap: 48 }}>
          {/* Left */}
          <div>
            <Link to="/">
              <img src={logoFightport} alt="Fightport" style={{ height: 22, filter: 'brightness(0) invert(1)' }} />
            </Link>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              {t('footer.tagline')}
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.2)', marginTop: 32 }}>
              © 2026 FightPort.pro · <a href="https://sportcombat.pro" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.2)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>SportCombat</a>
            </p>
          </div>

          {/* Right — link groups */}
          <div className="flex flex-wrap" style={{ gap: 48 }}>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{t('footer.product')}</span>
              <a href="/#busca" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('nav.verifyAthlete')}</a>
              <a href="/#como-funciona" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('nav.howItWorks')}</a>
              <a href="/#precos" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('footer.pricing')}</a>
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{t('footer.company')}</span>
              <a href="/sobre" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('footer.aboutUs')}</a>
              <a href="/contato" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('footer.contact')}</a>
            </div>
            <div className="flex flex-col">
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{t('footer.legal')}</span>
              <Link to="/termos" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('footer.terms')}</Link>
              <Link to="/privacidade" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('footer.privacy')}</Link>
              <a href="/lgpd" style={linkStyle} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>{t('footer.lgpd')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
