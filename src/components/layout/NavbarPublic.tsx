import { Link } from 'react-router-dom';
import logoFightport from '@/assets/logo-fightport.png';

export function NavbarPublic() {
  return (
    <header
      style={{
        height: 56,
        padding: '0 32px',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Link to="/" className="flex items-center">
        <img src={logoFightport} alt="Fightport" style={{ height: 24 }} />
      </Link>
      <Link to="/#busca">
        <button
          className="cursor-pointer"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 20px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--blue-deep)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-light)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Verificar outro atleta
        </button>
      </Link>
    </header>
  );
}
