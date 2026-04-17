import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay, startOfMonth, startOfYear, subDays, endOfDay } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, Building2, Users, Award, DollarSign, AlertCircle, MessageSquare } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Admin palette - uses CSS variables for consistency across /dash pages
const CHART_PRIMARY = 'var(--admin-chart-primary)';
const CHART_ACCENT = 'var(--admin-chart-accent)';
const CHART_GRAY = 'var(--admin-chart-gray-1)';

type PeriodKey = 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

const periods: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'month', label: 'Mês atual' },
  { key: 'year', label: 'Ano atual' },
  { key: 'custom', label: 'Personalizado' },
];

function getPeriodRange(key: PeriodKey, customRange?: { from?: Date; to?: Date }) {
  const now = new Date();
  switch (key) {
    case 'today': return { start: startOfDay(now), end: endOfDay(now) };
    case '7d': return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case '30d': return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case 'month': return { start: startOfMonth(now), end: endOfDay(now) };
    case 'year': return { start: startOfYear(now), end: endOfDay(now) };
    case 'custom':
      return {
        start: customRange?.from ? startOfDay(customRange.from) : startOfDay(subDays(now, 29)),
        end: customRange?.to ? endOfDay(customRange.to) : endOfDay(now),
      };
  }
}

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const fmtMonth = (m: string) => {
  const [y, mo] = m.split('-');
  return format(new Date(Number(y), Number(mo) - 1, 1), 'MMM/yy');
};

function StatCard({ icon: Icon, label, value, change, link }: { icon: any; label: string; value: string; change?: number; link?: string }) {
  const positive = (change ?? 0) >= 0;
  const content = (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 20,
        transition: 'var(--transition)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <Icon style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
        {change !== undefined && (
          <span className="flex items-center" style={{ gap: 4, fontSize: 12, fontFamily: 'var(--font-sans)', color: positive ? '#16a34a' : '#dc2626' }}>
            {positive ? <TrendingUp style={{ width: 12, height: 12 }} /> : <TrendingDown style={{ width: 12, height: 12 }} />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  );
  return link ? <Link to={link} className="no-underline">{content}</Link> : content;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md, 8px)',
        padding: 20,
      }}
    >
      <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', marginBottom: 16 }}>{title}</h3>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashDashboard() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  const range = useMemo(() => getPeriodRange(period, customRange), [period, customRange]);

  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_overview');
      if (error) throw error;
      return data as { schools_total: number; schools_prev: number; practitioners_total: number; practitioners_prev: number; achievements_month: number; revenue_month: number };
    },
  });

  const { data: growth = [] } = useQuery({
    queryKey: ['admin-growth'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_growth_monthly');
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ month: fmtMonth(r.month), schools: Number(r.schools_count), practitioners: Number(r.practitioners_count) }));
    },
  });

  const { data: revenue = [] } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_revenue_monthly');
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ month: fmtMonth(r.month), revenue: Number(r.revenue) }));
    },
  });

  const { data: byArt = [] } = useQuery({
    queryKey: ['admin-by-art', range.start.toISOString(), range.end.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_achievements_by_art', {
        p_start: range.start.toISOString(),
        p_end: range.end.toISOString(),
      });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ art: r.martial_art, total: Number(r.total) }));
    },
  });

  const { data: openTickets = 0 } = useQuery({
    queryKey: ['admin-open-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_open_tickets_count');
      if (error) throw error;
      return Number(data ?? 0);
    },
  });

  const { data: zeroBalance = [] } = useQuery({
    queryKey: ['admin-zero-balance'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_zero_balance_schools');
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: recentSchools = [] } = useQuery({
    queryKey: ['admin-recent-schools'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_recent_schools');
      if (error) throw error;
      return data ?? [];
    },
  });

  const schoolsChange = overview && overview.schools_prev > 0
    ? ((overview.schools_total - overview.schools_prev) / overview.schools_prev) * 100
    : 0;
  const practChange = overview && overview.practitioners_prev > 0
    ? ((overview.practitioners_total - overview.practitioners_prev) / overview.practitioners_prev) * 100
    : 0;

  return (
    <div style={{ padding: 32, maxWidth: 1600, margin: '0 auto' }}>
      <div className="flex items-center justify-between flex-wrap" style={{ gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, color: 'var(--color-text)' }}>Dashboard</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Visão operacional da plataforma
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center flex-wrap" style={{ gap: 6 }}>
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '6px 12px',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: period === p.key ? 500 : 400,
                color: period === p.key ? 'var(--color-bg)' : 'var(--color-text-muted)',
                background: period === p.key ? 'var(--color-text)' : 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm, 6px)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {p.label}
            </button>
          ))}
          {period === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center"
                  style={{
                    gap: 6, padding: '6px 12px', fontFamily: 'var(--font-sans)', fontSize: 13,
                    color: 'var(--color-text)', background: 'var(--color-bg-soft)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm, 6px)', cursor: 'pointer',
                  }}
                >
                  <CalendarIcon style={{ width: 14, height: 14 }} />
                  {customRange.from && customRange.to
                    ? `${format(customRange.from, 'dd/MM')} - ${format(customRange.to, 'dd/MM')}`
                    : 'Selecionar'}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={customRange as any}
                  onSelect={(r: any) => setCustomRange(r ?? {})}
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 20 }}>
        {/* MAIN COLUMN */}
        <div className="flex flex-col" style={{ gap: 20, minWidth: 0 }}>
          {/* Stat cards */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <StatCard icon={Building2} label="Escolas cadastradas" value={String(overview?.schools_total ?? 0)} change={schoolsChange} />
            <StatCard icon={Users} label="Atletas cadastrados" value={String(overview?.practitioners_total ?? 0)} change={practChange} />
            <StatCard icon={Award} label="Graduações no mês" value={String(overview?.achievements_month ?? 0)} />
            <StatCard icon={DollarSign} label="Receita do mês" value={fmtBRL(Number(overview?.revenue_month ?? 0))} />
          </div>

          {/* Charts */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <ChartCard title="Crescimento de escolas (12 meses)">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="schools" stroke={CHART_PRIMARY} strokeWidth={2} dot={{ r: 3, fill: CHART_PRIMARY }} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Crescimento de atletas (12 meses)">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="practitioners" stroke={CHART_ACCENT} strokeWidth={2} dot={{ r: 3, fill: CHART_ACCENT }} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Receita mensal (12 meses)">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }}
                  formatter={(v: any) => fmtBRL(Number(v))}
                />
                <Bar dataKey="revenue" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Graduações por modalidade (período)">
              <BarChart data={byArt}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="art" stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="total" fill={CHART_ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>
        </div>

        {/* RIGHT SIDEBAR — alerts */}
        <aside className="flex flex-col" style={{ gap: 16 }}>
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', padding: 16 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
              <MessageSquare style={{ width: 14, height: 14, color: 'var(--color-text-muted)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Tickets abertos</span>
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 600, color: 'var(--color-text)' }}>{openTickets}</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>aguardando resposta</div>
          </div>

          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', padding: 16 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
              <AlertCircle style={{ width: 14, height: 14, color: '#dc2626' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Saldo zerado (top 5)</span>
            </div>
            {zeroBalance.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>Nenhuma escola com saldo zero.</p>
            ) : (
              <ul className="flex flex-col" style={{ gap: 8 }}>
                {zeroBalance.map((s: any) => (
                  <li key={s.school_id} style={{ fontFamily: 'var(--font-sans)', fontSize: 12 }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{s.email}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md, 8px)', padding: 16 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
              <Building2 style={{ width: 14, height: 14, color: 'var(--color-text-muted)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>Novas escolas (7d)</span>
            </div>
            {recentSchools.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>Nenhuma escola cadastrada nos últimos 7 dias.</p>
            ) : (
              <ul className="flex flex-col" style={{ gap: 10 }}>
                {recentSchools.map((s: any) => (
                  <li key={s.school_id} style={{ fontFamily: 'var(--font-sans)', fontSize: 12 }}>
                    <div style={{ color: 'var(--color-text)', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                      {[s.city, s.state].filter(Boolean).join(' / ') || s.email} · {format(new Date(s.created_at), 'dd/MM')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
