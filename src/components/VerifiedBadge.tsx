import { CheckCircle } from 'lucide-react';

export function VerifiedBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--blue-light)',
        border: '1px solid var(--blue-mid)',
        borderRadius: 100,
        padding: '6px 18px 6px 10px',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--blue-deep)',
      }}
    >
      <CheckCircle style={{ width: 16, height: 16, color: 'var(--blue-deep)' }} />
      VERIFICADO POR FIGHTPORT.PRO
    </div>
  );
}
