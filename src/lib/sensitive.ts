// Utilitários de masking de dados sensíveis (apenas exibição).
// Os dados reais NUNCA são alterados no banco.

export function maskCpf(cpf?: string | null): string {
  if (!cpf) return '—';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length < 2) return '***.***.***-**';
  const last2 = digits.slice(-2);
  return `***.***.***-${last2}`;
}

export function maskBirthDate(date?: string | null): string {
  if (!date) return '—';
  // Espera ISO yyyy-mm-dd
  const year = date.slice(0, 4);
  return `**/**/${year || '****'}`;
}

export function formatCpf(cpf?: string | null): string {
  if (!cpf) return '—';
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function formatBirthDate(date?: string | null): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${d}/${m}/${y}`;
}
