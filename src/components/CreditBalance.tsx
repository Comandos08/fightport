import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreditBalanceProps {
  balance: number;
  compact?: boolean;
}

export function CreditBalance({ balance, compact = false }: CreditBalanceProps) {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center" style={{ gap: 6 }}>
        <Coins style={{ width: 16, height: 16, color: 'var(--color-text)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, color: 'var(--color-text)' }}>{balance}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center" style={{ gap: 8, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', background: 'var(--color-bg)' }}>
      <Coins style={{ width: 18, height: 18, color: 'var(--color-text)' }} />
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 16, color: 'var(--color-text)' }}>{balance}</span>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>{t('creditBalance.label')}</span>
    </div>
  );
}
