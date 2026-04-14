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
    <div style={{ padding: '32px 32px', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 24, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 28 }}>Créditos</h1>

      <div style={{ marginBottom: 32 }}>
        <CreditBalance balance={credits?.balance ?? 0} />
      </div>

      {/* Pricing table */}
      <div style={{ marginBottom: 16, maxWidth: 860 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 100px', padding: '0 20px 16px', borderBottom: '2px solid var(--color-text)' }}>
          {['PLANO', 'CRÉDITOS', 'PREÇO', 'POR GRAD.', ''].map(h => (
            <span key={h} style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>{h}</span>
          ))}
        </div>
        {/* Rows */}
        {packages.map(pkg => (
          <div
            key={pkg.name}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 100px 100px 100px',
              padding: '24px 20px',
              borderBottom: '1px solid var(--color-border)',
              background: pkg.highlight ? 'var(--color-bg-amber)' : 'transparent',
              borderRadius: pkg.highlight ? 'var(--radius-sm)' : 0,
              alignItems: 'center',
            }}
          >
            <div className="flex items-center" style={{ gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)' }}>{pkg.name}</span>
              {pkg.highlight && (
                <span style={{
                  background: '#1C1C1C',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                }}>
                  Mais popular
                </span>
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)' }}>{pkg.credits}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)' }}>R$ {pkg.price}</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 14, color: 'var(--color-text-muted)' }}>R$ {pkg.unit}</span>
            <button
              onClick={() => handleBuy(pkg.name)}
              disabled={loadingPkg !== null}
              className="flex items-center cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 14,
                color: 'var(--color-text)',
                gap: 4,
                padding: 0,
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              {loadingPkg === pkg.name ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
              {loadingPkg === pkg.name ? 'Aguarde...' : 'Comprar →'}
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 48 }}>Créditos nunca expiram. Use quando quiser.</p>

      {/* Transaction history */}
      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>Histórico de transações</h2>
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'auto' }}>
        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-soft)' }}>
              {['Data', 'Tipo', 'Créditos', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>Nenhuma transação ainda.</td></tr>
            ) : (
              transactions.map((tx: any, i: number) => (
                <tr
                  key={tx.id}
                  style={{ borderBottom: i !== transactions.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'var(--transition)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{formatDate(tx.created_at)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{tx.package_name ?? tx.type}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: 13,
                      color: '#2D6A4F',
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
