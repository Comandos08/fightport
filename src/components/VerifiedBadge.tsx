import { CheckCircle } from 'lucide-react';

export function VerifiedBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-display font-bold text-sm tracking-wide bg-verified text-verified">
      <CheckCircle className="h-4 w-4" />
      VERIFICADO POR FIGHTPORT.PRO
    </div>
  );
}
