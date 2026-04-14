import type { Belt } from '@/lib/mock-data';

interface BeltBadgeProps {
  belt: Belt;
  size?: 'sm' | 'md';
}

const BELT_STYLES: Record<string, { bg: string; color: string; border?: string }> = {
  Branca: { bg: 'var(--bg-3)', color: 'var(--muted)', border: '1px solid var(--border-2)' },
  Azul: { bg: 'var(--blue-deep)', color: '#ffffff' },
  Roxa: { bg: '#7c3aed', color: '#ffffff' },
  Marrom: { bg: '#92400e', color: '#ffffff' },
  Preta: { bg: '#111827', color: '#ffffff' },
  Vermelha: { bg: '#DC2626', color: '#ffffff' },
};

export function BeltBadge({ belt, size = 'md' }: BeltBadgeProps) {
  const s = BELT_STYLES[belt] || { bg: '#999', color: '#fff' };
  const padding = size === 'sm' ? '3px 10px' : '4px 12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 4,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        padding,
        backgroundColor: s.bg,
        color: s.color,
        border: s.border || 'none',
      }}
    >
      Faixa {belt}
    </span>
  );
}
