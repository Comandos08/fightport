import { useNavigate } from 'react-router-dom';
import type { Athlete } from '@/lib/mock-data';
import { getInitials, formatDate } from '@/lib/utils';
import { BeltBadge } from './BeltBadge';
import { CheckCircle, ArrowUpRight } from 'lucide-react';

interface AthleteCardProps {
  athlete: Athlete;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  const navigate = useNavigate();
  const lastAchievement = athlete.achievements[athlete.achievements.length - 1];

  return (
    <button
      onClick={() => navigate(`/p/${athlete.publicId}`)}
      className="group flex flex-col items-start gap-0 rounded-2xl bg-popover text-left w-full transition-all duration-300 ease-out hover:shadow-[0_16px_48px_rgba(0,0,0,0.1),0_0_0_1px_rgba(200,241,53,0.3)] hover:-translate-y-1.5 cursor-pointer relative overflow-hidden"
      style={{
        border: '1px solid var(--color-border)',
        padding: '20px',
      }}
    >
      {/* Hover accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(200,241,53,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Arrow indicator on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
        <ArrowUpRight className="w-4 h-4 text-ink-faint" />
      </div>

      {/* Avatar + info */}
      <div className="flex items-center gap-3 w-full mb-4 relative z-10">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
        >
          {getInitials(athlete.name, athlete.surname)}
        </div>
        <div className="min-w-0">
          <p className="font-body font-medium text-base text-ink truncate transition-colors duration-200">
            {athlete.name} {athlete.surname}
          </p>
          <p className="font-body text-[13px] text-ink-faint truncate">{athlete.school}</p>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-px mb-4 transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg-surface)' }} />

      {/* Belt + date */}
      <div className="flex items-center justify-between w-full mb-3 relative z-10">
        <div className="transition-transform duration-300 group-hover:translate-x-0.5">
          <BeltBadge belt={lastAchievement.belt} size="sm" />
        </div>
        <span className="font-body text-xs text-ink-faint">{formatDate(lastAchievement.date)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 relative z-10">
        <CheckCircle className="w-3 h-3 transition-transform duration-300 group-hover:scale-110" style={{ color: 'var(--color-verified)' }} />
        <span className="font-body text-[11px] text-ink-faint">Certificado por fightport.pro</span>
      </div>
    </button>
  );
}
