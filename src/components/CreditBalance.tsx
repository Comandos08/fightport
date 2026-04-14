import { Coins } from 'lucide-react';

interface CreditBalanceProps {
  balance: number;
  compact?: boolean;
}

export function CreditBalance({ balance, compact = false }: CreditBalanceProps) {
  if (compact) {
    return (
      <div className="flex items-center" style={{ gap: 6 }}>
        <Coins style={{ width: 16, height: 16, color: 'var(--blue-deep)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--blue-deep)' }}>{balance}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center"
      style={{
        gap: 8,
        border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 16px',
        background: 'var(--white)',
      }}
    >
      <Coins style={{ width: 18, height: 18, color: 'var(--blue-deep)' }} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--blue-deep)' }}>{balance}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>créditos</span>
    </div>
  );
}
