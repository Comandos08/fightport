import type { CSSProperties, ReactNode } from 'react';
import { DashTableSkeleton } from './DashTableSkeleton';
import { DashEmptyState } from './DashEmptyState';
import { DashPagination } from './DashPagination';
import type { LucideIcon } from 'lucide-react';

/* ============== Estilos compartilhados ============== */

/** Cabeçalho de coluna padrão das tabelas /dash. */
export const dashTh: CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-text-muted)',
  background: 'var(--color-bg-soft)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
};

/** Célula padrão das tabelas /dash. */
export const dashTd: CSSProperties = {
  padding: '10px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 300,
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
  verticalAlign: 'middle',
};

/* ============== Componente ============== */

type Props = {
  /** Cabeçalho: array de strings ou nodes JSX (para colunas com sort/ícones). */
  headers: ReactNode[];
  /** Linhas <tr> renderizadas pelo consumidor (apenas quando não está loading nem vazio). */
  children: ReactNode;
  /** Mostra skeleton em vez das linhas. */
  isLoading?: boolean;
  /** Mostra estado vazio em vez das linhas. */
  isEmpty?: boolean;
  /** Quantidade de linhas no skeleton (default 8). */
  skeletonRows?: number;
  /** Props do estado vazio (ícone, título, descrição). */
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  /** Paginação opcional no rodapé. */
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  };
};

/**
 * Wrapper padrão para tabelas /dash.
 * - Container com borda, radius e overflow horizontal
 * - Header com fundo soft e tipografia uppercase
 * - Skeleton/empty automáticos
 * - Paginação opcional no rodapé
 */
export function DashTable({
  headers,
  children,
  isLoading = false,
  isEmpty = false,
  skeletonRows = 8,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  pagination,
}: Props) {
  const columns = headers.length;

  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={dashTh}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <DashTableSkeleton columns={columns} rows={skeletonRows} />
            ) : isEmpty ? (
              <DashEmptyState
                columns={columns}
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
              />
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      {pagination && <DashPagination {...pagination} />}
    </div>
  );
}
