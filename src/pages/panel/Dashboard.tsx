import { Link } from 'react-router-dom';
import { Users, Award, Coins, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockAthletes, mockCurrentSchool, mockCredits } from '@/lib/mock-data';
import { BeltBadge } from '@/components/BeltBadge';
import { formatDate } from '@/lib/utils';

const stats = [
  { label: 'Total de praticantes', value: mockCurrentSchool.athleteCount, icon: Users },
  { label: 'Certificados emitidos', value: mockCurrentSchool.certificateCount, icon: Award },
  { label: 'Saldo de créditos', value: mockCredits.balance, icon: Coins, cta: mockCredits.balance < 5 },
  { label: 'Última graduação', value: '30/01/2024', icon: Calendar },
];

const recentAchievements = mockAthletes
  .flatMap(a => a.achievements.map(ach => ({ ...ach, athleteName: `${a.name} ${a.surname}` })))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);

export default function DashboardPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-8" style={{ letterSpacing: '0.02em' }}>Dashboard</h1>

      {/* Metrics */}
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

      {/* Alert if no credits */}
      {mockCredits.balance === 0 && (
        <div className="rounded-xl border-2 p-6 mb-8 text-center" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(200,241,53,0.08)' }}>
          <p className="font-body font-medium text-ink mb-2">Você não tem créditos.</p>
          <p className="font-body text-sm text-ink-muted mb-4">Compre agora para registrar graduações.</p>
          <Link to="/painel/creditos"><Button>Comprar créditos</Button></Link>
        </div>
      )}

      {/* Recent */}
      <h2 className="font-display font-bold text-lg text-ink mb-4 uppercase" style={{ letterSpacing: '0.02em' }}>Últimas conquistas</h2>
      <div className="rounded-xl border bg-main shadow-card overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {recentAchievements.map((ach, i) => (
          <div key={ach.id} className={`flex items-center gap-4 p-4 ${i !== recentAchievements.length - 1 ? 'border-b' : ''}`} style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex-1 min-w-0">
              <p className="font-body font-medium text-sm text-ink truncate">{ach.athleteName}</p>
              <p className="font-body text-xs text-ink-muted">{ach.school}</p>
            </div>
            <BeltBadge belt={ach.belt} size="sm" />
            <span className="font-body text-xs text-ink-faint whitespace-nowrap">{formatDate(ach.date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
