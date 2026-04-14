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
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const BELT_COLORS: Record<string, string> = {
  Branca: '#E8E8E5',
  Azul: '#134C73',
  Roxa: '#5B21B6',
  Marrom: '#78350F',
  Preta: '#1C1C1C',
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
    { label: 'Última graduação', value: lastDate, icon: Calendar, isDate: true },
  ];

  const beltChartConfig: ChartConfig = {
    count: { label: 'Praticantes' },
  };

  const monthlyChartConfig: ChartConfig = {
    count: { label: 'Conquistas', color: '#1C1C1C' },
  };

  const growthChartConfig: ChartConfig = {
    total: { label: 'Praticantes', color: '#1C1C1C' },
  };

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 28, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 32 }}>Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 12, marginBottom: 32 }}>
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              background: 'var(--color-bg-soft)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 24,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                {s.label}
              </span>
              {s.cta && (
                <Link to="/painel/creditos" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, color: 'var(--color-bg-amber)', textDecoration: 'none' }}>
                  Comprar mais
                </Link>
              )}
            </div>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: (s as any).isDate ? 24 : 36,
              color: 'var(--color-text)',
              letterSpacing: '-0.025em',
              margin: 0,
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {creditBalance === 0 && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24, marginBottom: 32, textAlign: 'center', background: 'var(--color-bg-soft)' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', marginBottom: 8 }}>Você não tem créditos.</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Compre agora para registrar graduações.</p>
          <Link to="/painel/creditos"><Button>Comprar créditos</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16, marginBottom: 32 }}>
        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>Distribuição por faixa</h2>
          {beltDistribution.length === 0 ? (
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', padding: '32px 0' }}>Nenhum praticante cadastrado.</p>
          ) : (
            <ChartContainer config={beltChartConfig} className="aspect-square max-h-[250px] mx-auto">
              <PieChart>
                <Pie data={beltDistribution} dataKey="count" nameKey="belt" cx="50%" cy="50%" outerRadius={90} innerRadius={40} strokeWidth={2} stroke="var(--color-bg)">
                  {beltDistribution.map((entry) => (
                    <Cell key={entry.belt} fill={BELT_COLORS[entry.belt] || '#999'} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          )}
          {beltDistribution.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center" style={{ marginTop: 12 }}>
              {beltDistribution.map((entry) => (
                <div key={entry.belt} className="flex items-center" style={{ gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: BELT_COLORS[entry.belt] || '#999' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-muted)' }}>{entry.belt} ({entry.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>Conquistas por mês</h2>
          {monthlyAchievements.every(m => m.count === 0) ? (
            <p style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', padding: '32px 0' }}>Nenhuma conquista nos últimos 6 meses.</p>
          ) : (
            <ChartContainer config={monthlyChartConfig} className="aspect-video max-h-[250px]">
              <BarChart data={monthlyAchievements}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontFamily: 'var(--font-sans)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} style={{ fontFamily: 'var(--font-sans)', fontSize: 11 }} />
                <Bar dataKey="count" fill="#1C1C1C" radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>Evolução de praticantes</h2>
        {practitionerGrowth.every(m => m.total === 0) ? (
          <p style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', padding: '32px 0' }}>Nenhum praticante cadastrado nos últimos 6 meses.</p>
        ) : (
          <ChartContainer config={growthChartConfig} className="aspect-video max-h-[250px]">
            <LineChart data={practitionerGrowth}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontFamily: 'var(--font-sans)', fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} style={{ fontFamily: 'var(--font-sans)', fontSize: 11 }} />
              <Line type="monotone" dataKey="total" stroke="#1C1C1C" strokeWidth={2} dot={{ r: 4, fill: '#1C1C1C' }} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </ChartContainer>
        )}
      </div>

      <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>Últimas conquistas</h2>
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        {recentAchievements.length === 0 ? (
          <p style={{ padding: 32, textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>Nenhuma conquista registrada ainda.</p>
        ) : (
          recentAchievements.map((ach: any, i: number) => (
            <div key={ach.id} className="flex items-center" style={{ gap: 16, padding: '14px 16px', borderBottom: i !== recentAchievements.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ach.practitioners?.first_name} {ach.practitioners?.last_name}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{ach.schools?.name}</p>
              </div>
              <BeltBadge belt={ach.belt} size="sm" />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{formatDate(ach.graduation_date)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
