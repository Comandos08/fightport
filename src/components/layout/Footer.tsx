import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-brand py-10" style={{ borderColor: 'var(--color-border)' }}>
      <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-baseline gap-0">
          <span className="font-display font-bold text-lg text-ink">fight</span>
          <span className="font-display font-normal text-lg text-ink">port</span>
          <span className="font-display font-bold text-lg text-accent-brand">.pro</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-ink-faint font-body">
          <Link to="/privacidade" className="hover:text-ink transition-colors">Privacidade</Link>
          <Link to="/termos" className="hover:text-ink transition-colors">Termos</Link>
        </div>
        <p className="text-xs text-ink-faint font-body">
          © 2026 fightport.pro · SportCombat
        </p>
      </div>
    </footer>
  );
}
