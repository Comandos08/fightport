import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CreditBalance } from '@/components/CreditBalance';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const packages = [
  { nameKey: 'pricing.plan.starter', credits: 10, price: 97, unit: '9,70', highlight: false, rawName: 'Starter' },
  { nameKey: 'pricing.plan.school', credits: 50, price: 397, unit: '7,94', highlight: true, rawName: 'Escola' },
  { nameKey: 'pricing.plan.org', credits: 150, price: 990, unit: '6,60', highlight: false, rawName: 'Organização' },
];

const thStyle: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-text-muted)', padding: '0 0 16px 0' };

export default function CreditosPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') { toast.success(t('credits.toast.success')); queryClient.invalidateQueries({ queryKey: ['credits'] }); queryClient.invalidateQueries({ queryKey: ['credit-transactions'] }); }
    else if (status === 'failure') { toast.error(t('credits.toast.failure')); }
    else if (status === 'pending') { toast.info(t('credits.toast.pending')); }
  }, [searchParams, queryClient, t]);

  const { data: credits } = useQuery({ queryKey: ['credits', user?.id], queryFn: async () => { const { data } = await supabase.from('credits').select('balance').eq('school_id', user!.id).single(); return data; }, enabled: !!user });
  const { data: transactions = [] } = useQuery({ queryKey: ['credit-transactions', user?.id], queryFn: async () => { const { data } = await supabase.from('credit_transactions').select('*').eq('school_id', user!.id).order('created_at', { ascending: false }); return data ?? []; }, enabled: !!user });

  const handleBuy = async (pkgRawName: string) => {
    setLoadingPkg(pkgRawName);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', { body: { package_name: pkgRawName } });
      if (error) throw error;
      if (data?.init_point) { window.location.href = data.init_point; } else { throw new Error('Nenhum link de checkout retornado'); }
    } catch (err: any) { toast.error('Erro ao iniciar checkout: ' + (err.message || 'Tente novamente')); setLoadingPkg(null); }
  };

  const formatDateLocal = (ts: string | null) => { if (!ts) return '—'; const d = new Date(ts); if (isNaN(d.getTime())) return '—'; return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

  const getTypeLabel = (tx: any) => {
    if (tx.package_name) return tx.package_name;
    if (tx.type === 'usage') return t('credits.type.usage');
    return tx.type;
  };

  const historyHeaders = [t('credits.history.date'), t('credits.history.type'), t('credits.history.amount'), t('credits.history.status')];

  return (
    <div style={{ padding: '32px 32px', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 28, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 32 }}>{t('credits.title')}</h1>
      <div style={{ marginBottom: 32 }}><CreditBalance balance={credits?.balance ?? 0} /></div>

      <div style={{ marginBottom: 16, maxWidth: 860 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup><col style={{ width: '35%' }} /><col style={{ width: '15%' }} /><col style={{ width: '20%' }} /><col style={{ width: '18%' }} /><col style={{ width: '12%' }} /></colgroup>
          <thead><tr style={{ borderBottom: '2px solid var(--color-text)' }}><th style={{ ...thStyle, textAlign: 'left' }}>{t('credits.plan')}</th><th style={{ ...thStyle, textAlign: 'right' }}>{t('credits.creditsCol')}</th><th style={{ ...thStyle, textAlign: 'right' }}>{t('credits.price')}</th><th style={{ ...thStyle, textAlign: 'right' }}>{t('credits.perGrad')}</th><th style={{ padding: '0 0 16px 0' }}></th></tr></thead>
          <tbody>
            {packages.map((pkg) => {
              const isHL = pkg.highlight;
              const name = t(pkg.nameKey);
              const tdBase: React.CSSProperties = { padding: '24px 0', fontFamily: 'var(--font-sans)', fontSize: 17, fontWeight: 500, color: 'var(--color-text)' };
              return (
                <tr key={pkg.nameKey} style={{ background: isHL ? 'var(--color-bg-amber)' : 'transparent' }}>
                  <td style={{ ...tdBase, padding: isHL ? '24px 20px' : '24px 0', borderBottom: isHL ? 'none' : '1px solid var(--color-border)', borderRadius: isHL ? '6px 0 0 6px' : 0 }}>
                    {name}{isHL && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1C1C1C', color: '#FFFFFF', padding: '2px 8px', borderRadius: 3, marginLeft: 10, verticalAlign: 'middle' }}>{t('credits.mostPopular')}</span>}
                  </td>
                  <td style={{ ...tdBase, textAlign: 'right', borderBottom: isHL ? 'none' : '1px solid var(--color-border)' }}>{pkg.credits}</td>
                  <td style={{ ...tdBase, textAlign: 'right', borderBottom: isHL ? 'none' : '1px solid var(--color-border)' }}>R$ {pkg.price}</td>
                  <td style={{ ...tdBase, textAlign: 'right', fontSize: 13, fontWeight: 400, color: isHL ? 'var(--color-text)' : 'var(--color-text-muted)', opacity: isHL ? 0.65 : 1, borderBottom: isHL ? 'none' : '1px solid var(--color-border)' }}>R$ {pkg.unit}/un</td>
                  <td style={{ ...tdBase, textAlign: 'right', padding: isHL ? '24px 20px' : '24px 0', borderBottom: isHL ? 'none' : '1px solid var(--color-border)', borderRadius: isHL ? '0 6px 6px 0' : 0 }}>
                    <button onClick={() => handleBuy(pkg.rawName)} disabled={loadingPkg !== null} className="flex items-center cursor-pointer" style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', gap: 4, padding: 0, textDecoration: 'none', transition: 'var(--transition)', marginLeft: 'auto' }} onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                      {loadingPkg === pkg.rawName ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
                      {loadingPkg === pkg.rawName ? t('credits.waiting') : t('credits.buy')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 48 }}>{t('credits.neverExpire')}</p>

      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('credits.history.title')}</h2>
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'auto' }}>
        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: 'var(--color-bg-soft)' }}>{historyHeaders.map(h => <th key={h} style={{ textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>{h}</th>)}</tr></thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>{t('credits.history.empty')}</td></tr>
            ) : transactions.map((tx: any, i: number) => (
              <tr key={tx.id} style={{ borderBottom: i !== transactions.length - 1 ? '1px solid var(--color-border)' : 'none', transition: 'var(--transition)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{formatDateLocal(tx.created_at)}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{getTypeLabel(tx)}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</td>
                <td style={{ padding: '14px 16px' }}><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: '#2D6A4F' }}>{tx.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
