import { useNavigate } from 'react-router-dom';
import type { Athlete } from '@/lib/mock-data';
import { getInitials, formatDate } from '@/lib/utils';
import { BeltBadge } from './BeltBadge';
import { CheckCircle } from 'lucide-react';

interface AthleteCardProps {
  athlete: Athlete;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  const navigate = useNavigate();
  const lastAchievement = athlete.achievements[athlete.achievements.length - 1];

  return (
    <button
      onClick={() => navigate(`/p/${athlete.publicId}`)}
      className="flex flex-col items-start gap-0 rounded-2xl bg-popover transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer text-left w-full"
      style={{
        border: '1px solid var(--color-border)',
        padding: '20px',
      }}
    >
      {/* Avatar + info */}
      <div className="flex items-center gap-3 w-full mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
          style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
        >
          {getInitials(athlete.name, athlete.surname)}
        </div>
        <div className="min-w-0">
          <p className="font-body font-medium text-base text-ink truncate">
            {athlete.name} {athlete.surname}
          </p>
          <p className="font-body text-[13px] text-ink-faint truncate">{athlete.school}</p>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-px mb-4" style={{ backgroundColor: 'var(--color-bg-surface)' }} />

      {/* Belt + date */}
      <div className="flex items-center justify-between w-full mb-3">
        <BeltBadge belt={lastAchievement.belt} size="sm" />
        <span className="font-body text-xs text-ink-faint">{formatDate(lastAchievement.date)}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <CheckCircle className="w-3 h-3" style={{ color: 'var(--color-verified)' }} />
        <span className="font-body text-[11px] text-ink-faint">Certificado por fightport.pro</span>
      </div>
    </button>
  );
}
