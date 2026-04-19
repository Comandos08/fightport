import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;            // zero-indexed
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

/**
 * Paginação padrão das páginas /dash.
 * Padrão de referência: src/pages/dash/Auditoria.tsx
 *  - Texto à esquerda: "Mostrando X–Y de N" (ou "Nenhum registro")
 *  - Botões à direita: ◀  page/total  ▶
 *  - Borda superior, padding 12px 16px, fonte 12px, cor muted
 */
export function DashPagination({ page, totalPages, total, limit, onPageChange }: Props) {
  const btn = (disabled: boolean) => ({
    padding: '6px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--color-bg)',
    cursor: disabled ? ('not-allowed' as const) : ('pointer' as const),
    opacity: disabled ? 0.4 : 1,
    color: 'var(--color-text)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const prevDisabled = page === 0;
  const nextDisabled = page + 1 >= totalPages;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid var(--color-border)',
        fontFamily: 'var(--font-sans)',
        fontSize: 12,
        color: 'var(--color-text-muted)',
      }}
    >
      <span>
        {total > 0
          ? `Mostrando ${page * limit + 1}–${Math.min((page + 1) * limit, Number(total))} de ${total}`
          : 'Nenhum registro'}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={prevDisabled}
          style={btn(prevDisabled)}
          aria-label="Página anterior"
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </button>
        <span style={{ padding: '6px 12px' }}>{page + 1} / {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={nextDisabled}
          style={btn(nextDisabled)}
          aria-label="Próxima página"
        >
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}
