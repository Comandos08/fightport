import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Largura mínima das colunas no auto-fit (default 180px, igual a Auditoria). */
  minColumnWidth?: number;
  style?: CSSProperties;
};

/**
 * Barra de filtros padrão das páginas /dash.
 * Padrão de referência: src/pages/dash/Auditoria.tsx
 *  - Fundo soft, borda sutil, padding 16
 *  - Grid auto-fit responsivo
 */
export function DashFiltersBar({ children, minColumnWidth = 180, style }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
        gap: 12,
        background: 'var(--color-bg-soft)',
        padding: 16,
        borderRadius: 'var(--radius)',
        border: '1px solid var(--color-border)',
        marginBottom: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============== Estilos compartilhados (consumidos pelas páginas) ============== */

export const dashInputStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 300,
  padding: '8px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  width: '100%',
  height: 36,
  outline: 'none',
};

export const dashLabelStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-text-muted)',
  marginBottom: 4,
  display: 'block',
};

/* Botão outline (Exportar CSV / PDF) — padrão Auditoria */
export const dashOutlineButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--color-text)',
  cursor: 'pointer',
};

/* Botão "Limpar" — mesmo outline mas com texto muted */
export const dashClearButtonStyle: CSSProperties = {
  ...dashOutlineButtonStyle,
  color: 'var(--color-text-muted)',
  width: '100%',
  justifyContent: 'center',
};
