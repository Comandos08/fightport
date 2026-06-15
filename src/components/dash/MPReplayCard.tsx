import { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const card: React.CSSProperties = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md, 8px)',
  padding: 16,
};
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 6, display: 'block',
};
const ipt: React.CSSProperties = {
  height: 36, padding: '0 12px', fontFamily: 'var(--font-sans)', fontSize: 13,
  background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', outline: 'none',
};

type Result = { ok: boolean; message: string; detail?: Record<string, unknown> };

export default function MPReplayCard() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const handleReplay = async () => {
    const v = value.trim();
    if (!v) return;
    setLoading(true);
    setResult(null);
    try {
      // Decide se é payment_id numérico ou referência (external_reference / código curto)
      const isNumeric = /^\d+$/.test(v);
      const body = isNumeric ? { payment_id: v } : { reference: v };
      const { data, error } = await supabase.functions.invoke('mp-replay-payment', { body });
      if (error) {
        setResult({ ok: false, message: error.message || 'Falha ao reprocessar pagamento.', detail: (error as any).context });
      } else if (data?.status === 'ok') {
        setResult({
          ok: true,
          message: `${data.credits_added} créditos adicionados (pagamento ${data.payment_id}).`,
          detail: data,
        });
      } else if (data?.status === 'duplicate') {
        setResult({ ok: true, message: `Esse pagamento (${data.payment_id}) já havia sido creditado.`, detail: data });
      } else {
        setResult({ ok: false, message: data?.error || 'Resposta inesperada do servidor.', detail: data });
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Erro desconhecido' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...card, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
            margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em',
            color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Reprocessar pagamento MercadoPago
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
            Use para creditar manualmente uma compra que não chegou pelo webhook. Idempotente — pode rodar várias vezes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flex: '1 1 320px' }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>ID do pagamento ou referência</label>
            <input
              type="text"
              style={{ ...ipt, width: '100%' }}
              placeholder="Ex.: 1234567890 ou B32WM7KDQYWX4YPSF"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleReplay}
            disabled={loading || !value.trim()}
            style={{
              ...ipt,
              cursor: loading ? 'wait' : 'pointer',
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              fontWeight: 600,
              padding: '0 16px',
              opacity: loading || !value.trim() ? 0.6 : 1,
            }}
          >
            {loading ? 'Processando…' : 'Reprocessar'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{
          marginTop: 12, padding: 12, borderRadius: 6, fontSize: 13,
          fontFamily: 'var(--font-sans)',
          background: result.ok ? 'rgba(0,160,80,0.08)' : 'rgba(220,40,40,0.08)',
          border: `1px solid ${result.ok ? 'rgba(0,160,80,0.3)' : 'rgba(220,40,40,0.3)'}`,
          color: 'var(--color-text)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          {result.ok
            ? <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
            : <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}
