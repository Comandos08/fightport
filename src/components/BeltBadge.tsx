import type { Belt } from '@/lib/mock-data';

interface BeltBadgeProps {
  belt: Belt | string;
  size?: 'sm' | 'md';
}

const BASE_BELT_STYLES: Record<string, { bg: string; color: string; border?: string }> = {
  Branca: { bg: '#F7F7F5', color: '#6B6B6B', border: '1px solid #E8E8E5' },
  Cinza: { bg: '#B3B3B3', color: '#FFFFFF' },
  Amarela: { bg: '#F4B400', color: '#1C1C1C' },
  Laranja: { bg: '#FF9900', color: '#FFFFFF' },
  Verde: { bg: '#0F9D58', color: '#FFFFFF' },
  Azul: { bg: '#4285F4', color: '#FFFFFF' },
  Roxa: { bg: '#833AB4', color: '#FFFFFF' },
  Marrom: { bg: '#653819', color: '#FFFFFF' },
  Preta: { bg: '#333333', color: '#FFFFFF' },
  Vermelha: { bg: '#DC2626', color: '#FFFFFF' },
};

// Cor vermelha para faixa preta com grau 7+
const BLACK_HIGH_DEGREE_COLOR = '#DA291C';

function parseBelt(belt: string): { baseBelt: string; degree: number | null } {
  // Match pattern like "Preta 3º Grau" or "Preta 1 Grau"
  const match = belt.match(/^(Preta)\s*(\d+)[º°]?\s*(?:Grau|grau)?$/i);
  if (match) {
    return { baseBelt: match[1], degree: parseInt(match[2], 10) };
  }
  // Also match just "Preta" without degree
  if (belt === 'Preta' || belt === 'preta') {
    return { baseBelt: 'Preta', degree: null };
  }
  return { baseBelt: belt, degree: null };
}

export function BeltBadge({ belt, size = 'md' }: BeltBadgeProps) {
  const { baseBelt, degree } = parseBelt(belt);
  
  // Lógica: faixa preta com grau 7, 8, ou 9 usa vermelho
  const isBlackHighDegree = baseBelt === 'Preta' && degree !== null && degree >= 7;
  
  let bgColor = BASE_BELT_STYLES[baseBelt]?.bg || '#999';
  if (isBlackHighDegree) {
    bgColor = BLACK_HIGH_DEGREE_COLOR;
  }
  
  const textColor = BASE_BELT_STYLES[baseBelt]?.color || '#fff';
  const border = BASE_BELT_STYLES[baseBelt]?.border;

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
        backgroundColor: bgColor,
        color: textColor,
        border: border || 'none',
      }}
    >
      Faixa {belt}
    </span>
  );
}
