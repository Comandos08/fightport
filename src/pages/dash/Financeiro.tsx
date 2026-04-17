import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, startOfYear, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import { Download, FileText, FileSpreadsheet, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

type Preset = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);

const fmtPct = (n: number) => `${(Number(n) || 0).toFixed(1)}%`;

const card: React.CSSProperties = {
  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md, 8px)', padding: 16,
};
const lbl: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase',
  letterSpacing: '0.04em', color: 'var(--color-text-muted)', marginBottom: 6, display: 'block',
};
const ipt: React.CSSProperties = {
  height: 32, padding: '0 10px', fontFamily: 'var(--font-sans)', fontSize: 13,
  background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm, 6px)', outline: 'none',
};

const PIE_COLORS = ['#C8F135', '#0D0D0D', '#94a3b8', '#f59e0b', '#ef4444', '#10b981'];

function getRange(preset: Preset, customFrom?: string, customTo?: string): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case 'today':  return { start: startOfDay(now), end: endOfDay(now) };
    case '7d':     return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case '30d':    return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case 'month':  return { start: startOfMonth(now), end: endOfDay(now) };
    case 'year':   return { start: startOfYear(now), end: endOfDay(now) };
    case 'custom': {
      const s = customFrom ? new Date(customFrom + 'T00:00:00') : startOfMonth(now);
      const e = customTo   ? new Date(customTo   + 'T23:59:59') : endOfDay(now);
      return { start: s, end: e };
    }
  }
}

export default function Financeiro() {
  const [preset, setPreset] = useState<Preset>('30d');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const range = useMemo(() => getRange(preset, from, to), [preset, from, to]);

  const { data: overview } = useQuery({
    queryKey: ['admin-finance-overview', range.start.toISOString(), range.end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_finance_overview', {
        p_start: range.start.toISOString(),
        p_end: range.end.toISOString(),
      } as any);
      if (error) throw error;
      return data as any;
    },
  });

  const { data: monthly = [] } = useQuery({
    queryKey: ['admin-revenue-monthly'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_revenue_monthly');
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: topSchools = [] } = useQuery({
    queryKey: ['admin-finance-top-schools', range.start.toISOString(), range.end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_finance_top_schools', {
        p_start: range.start.toISOString(),
        p_end: range.end.toISOString(),
        p_limit: 10,
      } as any);
      if (error) throw error;
      return data ?? [];
    },
  });

  const breakdown: { package: string; count: number; revenue: number }[] = overview?.breakdown ?? [];

  const exportCsv = async () => {
    const { data: all } = await supabase
      .from('credit_transactions')
      .select('created_at, school_id, type, status, amount, price_brl, package_name, payment_id')
      .gte('created_at', range.start.toISOString())
      .lt('created_at', range.end.toISOString())
      .eq('type', 'purchase')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    const rows = (all ?? []) as any[];
    const header = ['Data/hora', 'Escola ID', 'Tipo', 'Status', 'Créditos', 'Valor (R$)', 'Pacote', 'Payment ID'];
    const lines = [header.join(',')];
    for (const r of rows) {
      const cells = [
        format(new Date(r.created_at), 'yyyy-MM-dd HH:mm:ss'),
        r.school_id, r.type, r.status, r.amount,
        Number(r.price_brl ?? 0).toFixed(2),
        r.package_name ?? '', r.payment_id ?? '',
      ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`);
      lines.push(cells.join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${format(range.start, 'yyyyMMdd')}-${format(range.end, 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!overview) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('Relatório Financeiro — Fightport', margin, y);
    y += 22;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(
      `Período: ${format(range.start, 'dd/MM/yyyy')} — ${format(range.end, 'dd/MM/yyyy')} · gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      margin, y,
    );
    y += 24;

    autoTable(doc, {
      startY: y,
      head: [['Métrica', 'Valor']],
      body: [
        ['Receita do período',     fmtBRL(overview.revenue)],
        ['Transações',             String(overview.tx_count)],
        ['Ticket médio',           fmtBRL(overview.avg_ticket)],
        ['Escolas únicas no período', String(overview.unique_schools)],
        ['MRR (média 3 meses)',    fmtBRL(overview.mrr)],
        ['LTV estimado',           fmtBRL(overview.ltv)],
        ['Taxa de recompra',       fmtPct(overview.repurchase_rate)],
        ['Compras médias por escola', Number(overview.avg_purchases || 0).toFixed(2)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [13, 13, 13], textColor: [255, 255, 255] },
      styles: { font: 'helvetica', fontSize: 10 },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 20;

    if (breakdown.length) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text('Receita por pacote', margin, y); y += 8;
      autoTable(doc, {
        startY: y,
        head: [['Pacote', 'Transações', 'Receita']],
        body: breakdown.map(b => [b.package, String(b.count), fmtBRL(b.revenue)]),
        theme: 'grid',
        headStyles: { fillColor: [200, 241, 53], textColor: [13, 13, 13] },
        styles: { font: 'helvetica', fontSize: 10 },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 20;
    }

    if (topSchools.length) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text('Top 10 escolas por receita', margin, y); y += 8;
      autoTable(doc, {
        startY: y,
        head: [['#', 'Escola', 'Transações', 'Receita acumulada']],
        body: (topSchools as any[]).map((s, i) => [
          String(i + 1), s.school_name, String(s.tx_count), fmtBRL(s.total_revenue),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [13, 13, 13], textColor: [255, 255, 255] },
        styles: { font: 'helvetica', fontSize: 10 },
        margin: { left: margin, right: margin },
      });
    }

    doc.save(`financeiro-${format(range.start, 'yyyyMMdd')}-${format(range.end, 'yyyyMMdd')}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header + período + exports */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display, var(--font-sans))', fontSize: 22, fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
            Financeiro
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            Receita, MRR, LTV e recompra calculados em tempo real sobre as transações de compra.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={lbl}>Período</label>
            <select style={{ ...ipt }} value={preset} onChange={e => setPreset(e.target.value as Preset)}>
              <option value="today">Hoje</option>
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
              <option value="month">Mês atual</option>
              <option value="year">Ano atual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          {preset === 'custom' && (
            <>
              <div><label style={lbl}>De</label><input type="date" style={ipt} value={from} onChange={e => setFrom(e.target.value)} /></div>
              <div><label style={lbl}>Até</label><input type="date" style={ipt} value={to} onChange={e => setTo(e.target.value)} /></div>
            </>
          )}
          <button onClick={exportCsv} style={{ ...ipt, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileSpreadsheet style={{ width: 14, height: 14 }} /> CSV
          </button>
          <button onClick={exportPdf} style={{ ...ipt, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FileText style={{ width: 14, height: 14 }} /> PDF
          </button>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <Metric label="Receita do período" value={fmtBRL(overview?.revenue ?? 0)} />
        <Metric label="Transações" value={String(overview?.tx_count ?? 0)} />
        <Metric label="Ticket médio" value={fmtBRL(overview?.avg_ticket ?? 0)} />
        <Metric label="Escolas únicas" value={String(overview?.unique_schools ?? 0)} />
        <Metric label="MRR (média 3 meses)" value={fmtBRL(overview?.mrr ?? 0)} />
        <Metric label="LTV estimado" value={fmtBRL(overview?.ltv ?? 0)} />
        <Metric label="Taxa de recompra" value={fmtPct(overview?.repurchase_rate ?? 0)} />
        <Metric label="Compras / escola" value={Number(overview?.avg_purchases ?? 0).toFixed(2)} />
      </div>

      {/* Breakdown por pacote (cards) */}
      <div style={card}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
          Receita por pacote
        </h2>
        {breakdown.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhuma compra no período.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {breakdown.map(b => (
              <div key={b.package} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', padding: 12 }}>
                <div style={{ ...lbl, marginBottom: 4 }}>{b.package}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 600, color: 'var(--color-text)' }}>{fmtBRL(b.revenue)}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>{b.count} transaç{b.count === 1 ? 'ão' : 'ões'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <div style={card}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
            Receita mensal (12 meses)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={monthly as any[]} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={(v) => fmtBRL(Number(v))} width={80} />
                <RTooltip formatter={(v: any) => fmtBRL(Number(v))} />
                <Line type="monotone" dataKey="revenue" stroke="#0D0D0D" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
            Distribuição por pacote
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            {breakdown.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: 8 }}>Sem dados.</div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="revenue"
                    nameKey="package"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e: any) => e.package}
                  >
                    {breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v: any) => fmtBRL(Number(v))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top 10 escolas */}
      <div style={card}>
        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text)' }}>
          Top 10 escolas por receita acumulada
        </h3>
        {topSchools.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Nenhuma compra no período.</p>
        ) : (
          <div style={{ width: '100%', height: Math.max(220, topSchools.length * 32) }}>
            <ResponsiveContainer>
              <BarChart data={topSchools as any[]} layout="vertical" margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickFormatter={(v) => fmtBRL(Number(v))} />
                <YAxis dataKey="school_name" type="category" width={160} tick={{ fontSize: 11, fill: 'var(--color-text)' }} />
                <RTooltip formatter={(v: any) => fmtBRL(Number(v))} />
                <Bar dataKey="total_revenue" fill="#C8F135" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {topSchools.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(topSchools as any[]).map((s, i) => (
              <Link
                key={s.school_id}
                to={`/dash/organizacoes/${s.school_id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 8px', borderRadius: 'var(--radius-sm, 6px)',
                  fontFamily: 'var(--font-sans)', fontSize: 12,
                  color: 'var(--color-text)', textDecoration: 'none',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--color-text-muted)', minWidth: 18 }}>{i + 1}.</span>
                  <Building2 style={{ width: 12, height: 12 }} />
                  {s.school_name}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{fmtBRL(s.total_revenue)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={card}>
      <div style={lbl}>{label}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'var(--color-text)' }}>{value}</div>
    </div>
  );
}
