import type { Belt } from '@/lib/mock-data';

interface BeltBadgeProps {
  belt: Belt;
  degree?: number | null;
  size?: 'sm' | 'md';
}

const BELT_STYLES: Record<string, { bg: string; color: string; border?: string }> = {
  Branca: { bg: '#F7F7F5', color: '#6B6B6B', border: '1px solid #E8E8E5' },
  Cinza: { bg: '#B3B3B3', color: '#FFFFFF' },
  Amarela: { bg: '#F4B400', color: '#1C1C1C' },
  Laranja: { bg: '#FF9900', color: '#FFFFFF' },
  Verde: { bg: '#0F9D58', color: '#FFFFFF' },
  Azul: { bg: '#4285F4', color: '#FFFFFF' },
  Roxa: { bg: '#833AB4', color: '#FFFFFF' },
  Marrom: { bg: '#653819', color: '#FFFFFF' },
  Preta: { bg: '#333333', color: '#FFFFFF' },
  'Preta-7+': { bg: '#DA291C', color: '#FFFFFF' },
  Vermelha: { bg: '#DC2626', color: '#FFFFFF' },
};

export function BeltBadge({ belt, degree, size = 'md' }: BeltBadgeProps) {
  // Lógica para faixa preta com grau 7+ usar vermelho
  const isBlackHighDegree = belt === 'Preta' && degree !== null && degree >= 7;
  const styleKey = isBlackHighDegree ? 'Preta-7+' : belt;
  const s = BELT_STYLES[styleKey] || { bg: '#999', color: '#fff' };

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
      {degree !== null && degree !== undefined && (
        <span style={{ marginLeft: 4, opacity: 0.9 }}>{degree}º</span>
      )}
    </span>
  );
}
