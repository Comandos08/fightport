import type { Belt } from '@/lib/mock-data';

interface BeltBadgeProps {
  belt: Belt;
  size?: 'sm' | 'md';
}

const BELT_STYLES: Record<string, { bg: string; color: string; border?: string }> = {
  Branca: { bg: '#F7F7F5', color: '#6B6B6B', border: '1px solid #E8E8E5' },
  Cinza: { bg: '#9CA3AF', color: '#FFFFFF' },
  Amarela: { bg: '#EAB308', color: '#1C1C1C' },
  Laranja: { bg: '#EA580C', color: '#FFFFFF' },
  Verde: { bg: '#14532D', color: '#FFFFFF' },
  Azul: { bg: '#4285F4', color: '#FFFFFF' },
  Roxa: { bg: '#5B21B6', color: '#FFFFFF' },
  Marrom: { bg: '#78350F', color: '#FFFFFF' },
  Preta: { bg: '#1C1C1C', color: '#FFFFFF' },
  Vermelha: { bg: '#DC2626', color: '#FFFFFF' },
};

export function BeltBadge({ belt, size = 'md' }: BeltBadgeProps) {
  const s = BELT_STYLES[belt] || { bg: '#999', color: '#fff' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 3,
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '3px 8px',
        backgroundColor: s.bg,
        color: s.color,
        border: s.border || 'none',
      }}
    >
      Faixa {belt}
    </span>
  );
}
