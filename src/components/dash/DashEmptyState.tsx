import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  /** Número de colunas da tabela (para o colSpan do <tr>). */
  columns: number;
  icon?: LucideIcon;
  title?: string;
  description?: ReactNode;
};

/**
 * Estado vazio padrão para tabelas /dash (renderiza um <tr> com <td colSpan>).
 * Ícone + título + descrição opcional, centralizado e com cor muted.
 */
export function DashEmptyState({
  columns,
  icon: Icon = Inbox,
  title = 'Nenhum registro encontrado',
  description,
}: Props) {
  return (
    <tr>
      <td
        colSpan={columns}
        style={{
          padding: '48px 16px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--color-bg-soft)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <Icon style={{ width: 20, height: 20 }} />
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: 'var(--color-text-muted)',
                maxWidth: 360,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
