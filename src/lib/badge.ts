/**
 * Formata o valor de um badge de contagem.
 * - 0 → null (não renderizar)
 * - 1..9 → string do número
 * - >9 → "9+"
 * - valores negativos/inválidos → null
 */
export function formatBadgeCount(count: number | null | undefined): string | null {
  if (count == null || !Number.isFinite(count)) return null;
  const n = Math.floor(count);
  if (n <= 0) return null;
  if (n > 9) return '9+';
  return String(n);
}
