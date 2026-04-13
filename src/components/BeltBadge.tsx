import type { Belt } from '@/lib/mock-data';
import { beltColor, beltTextColor } from '@/lib/utils';

interface BeltBadgeProps {
  belt: Belt;
  size?: 'sm' | 'md';
}

export function BeltBadge({ belt, size = 'md' }: BeltBadgeProps) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-body font-medium ${padding}`}
      style={{
        backgroundColor: beltColor(belt),
        color: beltTextColor(belt),
        border: belt === 'Branca' ? '1px solid var(--color-border)' : 'none',
      }}
    >
      Faixa {belt}
    </span>
  );
}
