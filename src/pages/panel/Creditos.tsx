import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CreditBalance } from '@/components/CreditBalance';

import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const packages = [
  { name: 'Starter', credits: 10, price: 97, unit: '9,70', highlight: false },
  { name: 'Escola', credits: 50, price: 397, unit: '7,94', highlight: true },
  { name: 'Academia', credits: 150, price: 990, unit: '6,60', highlight: false },
];

export default function CreditosPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      toast.success('Pagamento aprovado! Seus créditos serão adicionados em instantes.');
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    } else if (status === 'failure') {
      toast.error('Pagamento não aprovado. Tente novamente.');
    } else if (status === 'pending') {
      toast.info('Pagamento pendente. Seus créditos serão adicionados quando confirmado.');
    }
  }, [searchParams, queryClient]);

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

  const handleBuy = async (pkgName: string) => {
    setLoadingPkg(pkgName);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: { package_name: pkgName },
      });
      if (error) throw error;
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('Nenhum link de checkout retornado');
      }
    } catch (err: any) {
      toast.error('Erro ao iniciar checkout: ' + (err.message || 'Tente novamente'));
      setLoadingPkg(null);
    }
  };

  const formatDate = (ts: string | null) => {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 24 }}>Créditos</h1>

      <div style={{ marginBottom: 32 }}>
        <CreditBalance balance={credits?.balance ?? 0} />
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, marginBottom: 16, maxWidth: 860 }}>
        {packages.map(pkg => (
          <div
            key={pkg.name}
            style={{
              background: 'var(--white)',
              border: pkg.highlight ? '2px solid var(--blue-deep)' : '1px solid var(--border-2)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 28px',
              position: 'relative',
              transform: pkg.highlight ? 'scale(1.04)' : 'none',
              boxShadow: pkg.highlight ? 'var(--shadow-btn)' : 'none',
              textAlign: 'center',
            }}
          >
            {pkg.highlight && (
              <span style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--terra)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                padding: '5px 16px',
                borderRadius: 100,
              }}>
                Mais popular
              </span>
            )}
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>{pkg.name}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52, color: 'var(--blue-deep)', letterSpacing: '-0.025em', lineHeight: 1, margin: '0 0 4px' }}>{pkg.credits}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>créditos</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ink)', marginBottom: 2 }}>R$ {pkg.price}</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>R${pkg.unit}/un</p>
            <button
              onClick={() => handleBuy(pkg.name)}
              disabled={loadingPkg !== null}
              className="flex items-center justify-center cursor-pointer"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: pkg.highlight ? 'none' : '1.5px solid var(--border-2)',
                background: pkg.highlight ? 'var(--terra)' : 'transparent',
                color: pkg.highlight ? '#ffffff' : 'var(--blue-deep)',
                transition: 'var(--transition)',
                gap: 8,
              }}
            >
              {loadingPkg === pkg.name ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
              {loadingPkg === pkg.name ? 'Redirecionando...' : 'Comprar'}
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 48 }}>Créditos nunca expiram. Use quando quiser.</p>

      {/* Transaction history */}
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 16 }}>Histórico de transações</h2>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'auto' }}>
        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              {['Data', 'Tipo', 'Créditos', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', padding: '10px 16px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>Nenhuma transação ainda.</td></tr>
            ) : (
              transactions.map((tx: any, i: number) => (
                <tr
                  key={tx.id}
                  style={{ borderBottom: i !== transactions.length - 1 ? '1px solid var(--border)' : 'none', transition: 'var(--transition)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>{formatDate(tx.created_at)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>{tx.package_name ?? tx.type}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 700,
                      fontSize: 12,
                      color: 'var(--terra)',
                    }}>
                      {tx.status}
                    </span>
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
