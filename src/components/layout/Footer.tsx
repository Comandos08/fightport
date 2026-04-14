import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t py-12" style={{ borderColor: 'var(--color-border)' }}>
      <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Logo + tagline */}
        <div>
          <div className="flex items-baseline gap-0 mb-2">
            <span className="font-display font-bold text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
            <span className="font-display font-normal text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
            <span className="font-display font-bold text-[16px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
          </div>
          <p className="font-body text-[13px] text-ink-faint">O passaporte do seu atleta.</p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-body text-ink-faint md:justify-center">
          <a href="/#busca" className="hover:text-ink transition-colors">Verificar Atleta</a>
          <a href="/#como-funciona" className="hover:text-ink transition-colors">Como Funciona</a>
          <Link to="/cadastro" className="hover:text-ink transition-colors">Para Escolas</Link>
        </div>

        {/* Legal */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-body text-ink-faint md:justify-end">
          <Link to="/privacidade" className="hover:text-ink transition-colors">Privacidade</Link>
          <Link to="/termos" className="hover:text-ink transition-colors">Termos</Link>
          <span>© 2026 fightport.pro · SportCombat</span>
        </div>
      </div>
    </footer>
  );
}
