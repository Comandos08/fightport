import { Link } from 'react-router-dom';
import { Users, Award, Coins, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  const lastDate = recentAchievements.length > 0 ? formatDate(recentAchievements[0].graduation_date) : '—';

  const stats = [
    { label: 'Total de praticantes', value: practitionerCount, icon: Users },
    { label: 'Certificados emitidos', value: achievementCount, icon: Award },
    { label: 'Saldo de créditos', value: creditBalance, icon: Coins, cta: creditBalance < 5 },
    { label: 'Última graduação', value: lastDate, icon: Calendar },
  ];

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
