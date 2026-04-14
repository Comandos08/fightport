import { Link } from 'react-router-dom';
import { CreditBalance } from '@/components/CreditBalance';
import { mockCurrentSchool, mockCredits } from '@/lib/mock-data';
import { User } from 'lucide-react';

export function NavbarPanel() {
  return (
    <header className="h-16 border-b flex items-center px-4 lg:px-6 bg-main shrink-0" style={{ borderColor: 'var(--color-border)' }}>
      <div className="lg:hidden mr-3">
        <Link to="/" className="flex items-baseline">
          <span className="font-display font-bold text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>FIGHT</span>
          <span className="font-display font-normal text-[16px] text-ink" style={{ letterSpacing: '0.05em' }}>PORT</span>
          <span className="font-display font-bold text-[16px] text-accent-brand" style={{ letterSpacing: '0.05em' }}>.PRO</span>
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <CreditBalance balance={mockCredits.balance} compact />
        <div className="h-8 w-px bg-surface" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
            <User className="h-4 w-4 text-ink-muted" />
          </div>
          <span className="hidden sm:block font-body text-sm text-ink">{mockCurrentSchool.name}</span>
        </div>
      </div>
    </header>
  );
}
