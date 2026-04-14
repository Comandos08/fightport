import type { Belt } from '@/lib/mock-data';

interface BeltBadgeProps {
  belt: Belt;
  size?: 'sm' | 'md';
}

const BELT_STYLES: Record<string, { bg: string; color: string; border?: string }> = {
  Branca: { bg: 'var(--color-bg-soft)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' },
  Azul: { bg: '#134C73', color: '#ffffff' },
  Roxa: { bg: '#5B21B6', color: '#ffffff' },
  Marrom: { bg: '#78350F', color: '#ffffff' },
  Preta: { bg: '#1C1C1C', color: '#ffffff' },
  Vermelha: { bg: '#DC2626', color: '#ffffff' },
};

export function BeltBadge({ belt, size = 'md' }: BeltBadgeProps) {
  const s = BELT_STYLES[belt] || { bg: '#999', color: '#fff' };
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-xs)',
        fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
        fontWeight: 500,
        fontSize: 10,
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
