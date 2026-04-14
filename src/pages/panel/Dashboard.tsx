import { Link } from 'react-router-dom';
import { Users, Award, Coins, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const BELT_COLORS: Record<string, string> = {
  Branca: '#E5E5E5',
  Azul: '#3B82F6',
  Roxa: '#8B5CF6',
  Marrom: '#92400E',
  Preta: '#0D0D0D',
  Vermelha: '#DC2626',
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: practitionerCount = 0 } = useQuery({
    queryKey: ['practitioner-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase.from('practitioners').select('*', { count: 'exact', head: true }).eq('school_id', user!.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: achievementCount = 0 } = useQuery({
    queryKey: ['achievement-count', user?.id],
    queryFn: async () => {
      const { count } = await supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('school_id', user!.id);
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('credits').select('balance').eq('school_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const creditBalance = credits?.balance ?? 0;

  const { data: recentAchievements = [] } = useQuery({
    queryKey: ['recent-achievements', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('achievements')
        .select('id, belt, graduation_date, graduated_by, practitioner_id, practitioners(first_name, last_name), schools(name)')
        .eq('school_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Belt distribution data
  const { data: beltDistribution = [] } = useQuery({
    queryKey: ['belt-distribution', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('practitioners')
        .select('current_belt')
        .eq('school_id', user!.id);
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        const belt = p.current_belt || 'Branca';
        counts[belt] = (counts[belt] || 0) + 1;
      });
      return Object.entries(counts).map(([belt, count]) => ({ belt, count }));
    },
    enabled: !!user,
  });

  // Monthly achievements (last 6 months)
  const { data: monthlyAchievements = [] } = useQuery({
    queryKey: ['monthly-achievements', user?.id],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      const { data } = await supabase
        .from('achievements')
        .select('graduation_date')
        .eq('school_id', user!.id)
        .gte('graduation_date', sixMonthsAgo.toISOString().split('T')[0]);
      if (!data) return [];
      const counts: Record<string, number> = {};
      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        counts[key] = 0;
      }
      data.forEach((a) => {
        const d = new Date(a.graduation_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key in counts) counts[key] = (counts[key] || 0) + 1;
      });
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return Object.entries(counts).map(([key, count]) => ({
        month: monthNames[parseInt(key.split('-')[1]) - 1],
        count,
      }));
    },
    enabled: !!user,
  });

  // Practitioner growth (last 6 months cumulative)
  const { data: practitionerGrowth = [] } = useQuery({
    queryKey: ['practitioner-growth', user?.id],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      const { data } = await supabase
        .from('practitioners')
        .select('created_at')
        .eq('school_id', user!.id);
      if (!data) return [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const months: { key: string; label: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
          label: monthNames[d.getMonth()],
        });
      }
      // Count cumulative practitioners up to end of each month
      return months.map((m) => {
        const endOfMonth = new Date(`${m.key}-01`);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        const total = data.filter((p) => new Date(p.created_at!) < endOfMonth).length;
        return { month: m.label, total };
      });
    },
    enabled: !!user,
  });

  const lastDate = recentAchievements.length > 0 ? formatDate(recentAchievements[0].graduation_date) : '—';

  const stats = [
    { label: 'Total de praticantes', value: practitionerCount, icon: Users },
    { label: 'Certificados emitidos', value: achievementCount, icon: Award },
    { label: 'Saldo de créditos', value: creditBalance, icon: Coins, cta: creditBalance < 5 },
    { label: 'Última graduação', value: lastDate, icon: Calendar },
  ];

  const beltChartConfig: ChartConfig = {
    count: { label: 'Praticantes' },
  };

  const monthlyChartConfig: ChartConfig = {
    count: { label: 'Conquistas', color: 'hsl(var(--accent))' },
  };

  const growthChartConfig: ChartConfig = {
    total: { label: 'Praticantes', color: 'hsl(var(--accent))' },
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-8" style={{ letterSpacing: '0.02em' }}>Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border p-5 bg-main shadow-card" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <s.icon className="h-5 w-5 text-ink-faint" />
              {s.cta && (
                <Link to="/painel/creditos">
                  <span className="text-xs font-body font-medium text-accent-brand hover:underline cursor-pointer">Comprar mais</span>
                </Link>
              )}
            </div>
            <p className="font-display font-bold text-2xl text-ink">{s.value}</p>
            <p className="font-body text-sm text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {creditBalance === 0 && (
        <div className="rounded-xl border-2 p-6 mb-8 text-center" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(200,241,53,0.08)' }}>
          <p className="font-body font-medium text-ink mb-2">Você não tem créditos.</p>
          <p className="font-body text-sm text-ink-muted mb-4">Compre agora para registrar graduações.</p>
          <Link to="/painel/creditos"><Button>Comprar créditos</Button></Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Belt distribution */}
        <div className="rounded-xl border bg-main shadow-card p-5" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-sm text-ink uppercase mb-4" style={{ letterSpacing: '0.02em' }}>Distribuição por faixa</h2>
          {beltDistribution.length === 0 ? (
            <p className="text-center font-body text-sm text-ink-muted py-8">Nenhum praticante cadastrado.</p>
          ) : (
            <ChartContainer config={beltChartConfig} className="aspect-square max-h-[250px] mx-auto">
              <PieChart>
                <Pie
                  data={beltDistribution}
                  dataKey="count"
                  nameKey="belt"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {beltDistribution.map((entry) => (
                    <Cell key={entry.belt} fill={BELT_COLORS[entry.belt] || '#999'} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          )}
          {beltDistribution.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center mt-3">
              {beltDistribution.map((entry) => (
                <div key={entry.belt} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BELT_COLORS[entry.belt] || '#999' }} />
                  <span className="font-body text-xs text-ink-muted">{entry.belt} ({entry.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly achievements */}
        <div className="rounded-xl border bg-main shadow-card p-5" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-sm text-ink uppercase mb-4" style={{ letterSpacing: '0.02em' }}>Conquistas por mês</h2>
          {monthlyAchievements.every(m => m.count === 0) ? (
            <p className="text-center font-body text-sm text-ink-muted py-8">Nenhuma conquista nos últimos 6 meses.</p>
          ) : (
            <ChartContainer config={monthlyChartConfig} className="aspect-video max-h-[250px]">
              <BarChart data={monthlyAchievements}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="font-body text-xs" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} className="font-body text-xs" />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <h2 className="font-display font-bold text-lg text-ink mb-4 uppercase" style={{ letterSpacing: '0.02em' }}>Últimas conquistas</h2>
      <div className="rounded-xl border bg-main shadow-card overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {recentAchievements.length === 0 ? (
          <p className="p-8 text-center font-body text-sm text-ink-muted">Nenhuma conquista registrada ainda.</p>
        ) : (
          recentAchievements.map((ach: any, i: number) => (
            <div key={ach.id} className={`flex items-center gap-4 p-4 ${i !== recentAchievements.length - 1 ? 'border-b' : ''}`} style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-sm text-ink truncate">
                  {ach.practitioners?.first_name} {ach.practitioners?.last_name}
                </p>
                <p className="font-body text-xs text-ink-muted">{ach.schools?.name}</p>
              </div>
              <BeltBadge belt={ach.belt} size="sm" />
              <span className="font-body text-xs text-ink-faint whitespace-nowrap">{formatDate(ach.graduation_date)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
