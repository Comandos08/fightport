type Props = {
  rows?: number;
  columns: number;
};

/**
 * Skeleton padrão para tabelas /dash durante isLoading.
 * Renderiza N linhas <tr> com barras animadas pulsando, uma por coluna.
 */
export function DashTableSkeleton({ rows = 8, columns }: Props) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={`sk-${r}`}>
          {Array.from({ length: columns }).map((_, c) => (
            <td
              key={`sk-${r}-${c}`}
              style={{
                padding: '12px 10px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  height: 12,
                  width: `${60 + ((r * 7 + c * 13) % 35)}%`,
                  background: 'var(--color-bg-soft)',
                  borderRadius: 4,
                  animation: 'pulse 1.4s ease-in-out infinite',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
