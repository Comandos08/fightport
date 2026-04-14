import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t py-12" style={{ borderColor: 'var(--color-border)' }}>
      <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div>
          <div className="flex items-baseline gap-0 mb-2">
            <span className="font-display font-bold text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
            <span className="font-display font-normal text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
            <span className="font-display font-bold text-[16px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
          </div>
          <p className="font-body text-[13px] text-ink-faint">{t('footer.tagline')}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-body text-ink-faint md:justify-center">
          <a href="/#busca" className="hover:text-ink transition-colors">{t('nav.verifyAthlete')}</a>
          <a href="/#como-funciona" className="hover:text-ink transition-colors">{t('nav.howItWorks')}</a>
          <Link to="/cadastro" className="hover:text-ink transition-colors">{t('nav.forSchools')}</Link>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-body text-ink-faint md:justify-end">
          <Link to="/privacidade" className="hover:text-ink transition-colors">{t('footer.privacy')}</Link>
          <Link to="/termos" className="hover:text-ink transition-colors">{t('footer.terms')}</Link>
          <span>© 2026 fightport.pro · <a href="https://sportcombat.pro" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors underline underline-offset-2">SportCombat</a></span>
        </div>
      </div>
    </footer>
  );
}
