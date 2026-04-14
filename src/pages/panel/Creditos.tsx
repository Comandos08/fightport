import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CreditBalance } from '@/components/CreditBalance';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const packages = [
  { name: 'Starter', credits: 10, price: 97, unit: '9,70', highlight: false },
  { name: 'Escola', credits: 50, price: 397, unit: '7,94', highlight: true },
  { name: 'Academia', credits: 150, price: 990, unit: '6,60', highlight: false },
];

export default function CreditosPage() {
  const { user } = useAuth();

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('credits').select('balance').eq('school_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['credit-transactions', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('school_id', user!.id)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-6" style={{ letterSpacing: '0.02em' }}>Créditos</h1>

      <div className="mb-8">
        <CreditBalance balance={credits?.balance ?? 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {packages.map(pkg => (
          <div key={pkg.name} className={`rounded-xl border p-6 bg-main shadow-card relative ${pkg.highlight ? 'border-2' : ''}`} style={{ borderColor: pkg.highlight ? 'var(--color-accent)' : 'var(--color-border)' }}>
            {pkg.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-body font-medium bg-accent text-accent-foreground">
                Mais popular
              </span>
            )}
            <div className="text-center">
              <h3 className="font-display font-bold text-lg text-ink mb-1">{pkg.name} {pkg.highlight && '⭐'}</h3>
              <p className="font-display font-bold text-3xl text-ink mb-1">{pkg.credits}</p>
              <p className="font-body text-sm text-ink-muted mb-1">créditos</p>
              <p className="font-display font-bold text-xl text-ink mb-0.5">R$ {pkg.price}</p>
              <p className="font-body text-xs text-ink-faint mb-4">R${pkg.unit}/un</p>
              <Button className="w-full" variant={pkg.highlight ? 'default' : 'ghost'} onClick={() => toast('Em breve — integração de pagamento')}>
                Comprar
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="font-body text-sm text-ink-muted text-center mb-12">Créditos nunca expiram. Use quando quiser.</p>

      <h2 className="font-display font-bold text-lg text-ink mb-4 uppercase" style={{ letterSpacing: '0.02em' }}>Histórico de transações</h2>
      <div className="rounded-xl border bg-main shadow-card overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Data</th>
              <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Tipo</th>
              <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Créditos</th>
              <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center font-body text-sm text-ink-muted">Nenhuma transação ainda.</td></tr>
            ) : (
              transactions.map((tx: any, i: number) => (
                <tr key={tx.id} className={i !== transactions.length - 1 ? 'border-b' : ''} style={{ borderColor: 'var(--color-border)' }}>
                  <td className="p-4 font-body text-sm text-ink">{formatDate(tx.created_at)}</td>
                  <td className="p-4 font-body text-sm text-ink">{tx.package_name ?? tx.type}</td>
                  <td className="p-4 font-body text-sm text-ink">{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-body font-medium bg-verified text-verified">{tx.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
