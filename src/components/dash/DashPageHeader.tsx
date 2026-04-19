import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

/**
 * Cabeçalho padrão das páginas /dash.
 * Padrão de referência: src/pages/dash/Auditoria.tsx
 */
export function DashPageHeader({ title, subtitle, actions }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 24,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display, var(--font-sans))',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 300,
              color: 'var(--color-text-muted)',
              margin: '4px 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
