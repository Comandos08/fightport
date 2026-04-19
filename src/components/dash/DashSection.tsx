import type { CSSProperties, ReactNode } from 'react';

type Props = {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Remove o padding interno (útil quando o conteúdo já controla espaçamento). */
  flush?: boolean;
  style?: CSSProperties;
};

/**
 * Card/seção padrão das páginas /dash (especialmente páginas de detalhe).
 * Mantém o mesmo visual usado nas tabelas e blocos das páginas de listagem.
 */
export function DashSection({ title, actions, children, flush = false, style }: Props) {
  return (
    <section
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: flush ? 0 : 20,
        ...style,
      }}
    >
      {(title || actions) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: title ? 16 : 0,
            padding: flush ? '20px 20px 0' : 0,
          }}
        >
          {title && (
            <h2
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {title}
            </h2>
          )}
          {actions && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
