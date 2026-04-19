import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  to: string;
  label: string;
};

/**
 * Link "Voltar para …" usado no topo das páginas de detalhe /dash.
 * Mantém ícone, espaçamento, cor e tipografia idênticos entre páginas.
 */
export function DashBackLink({ to, label }: Props) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        textDecoration: 'none',
        alignSelf: 'flex-start',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <ArrowLeft style={{ width: 12, height: 12 }} /> {label}
    </Link>
  );
}
