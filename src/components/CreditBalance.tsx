import { Coins } from 'lucide-react';

interface CreditBalanceProps {
  balance: number;
  compact?: boolean;
}

export function CreditBalance({ balance, compact = false }: CreditBalanceProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 font-body text-sm font-medium text-ink">
        <Coins className="h-4 w-4 text-accent-brand" />
        {balance}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand px-4 py-2 bg-main">
      <Coins className="h-5 w-5 text-accent-brand" />
      <span className="font-display font-bold text-base text-ink">{balance}</span>
      <span className="text-sm text-ink-muted">créditos</span>
    </div>
  );
}
