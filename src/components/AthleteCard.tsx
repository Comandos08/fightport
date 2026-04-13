import { useNavigate } from 'react-router-dom';
import type { Athlete } from '@/lib/mock-data';
import { getInitials, formatDate } from '@/lib/utils';
import { BeltBadge } from './BeltBadge';

interface AthleteCardProps {
  athlete: Athlete;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  const navigate = useNavigate();
  const lastAchievement = athlete.achievements[athlete.achievements.length - 1];

  return (
    <button
      onClick={() => navigate(`/p/${athlete.publicId}`)}
      className="flex flex-col items-start gap-3 rounded-xl border border-brand p-5 bg-main shadow-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-left w-full"
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
          style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}
        >
          {getInitials(athlete.name, athlete.surname)}
        </div>
        <div className="min-w-0">
          <p className="font-display font-bold text-base text-ink truncate">
            {athlete.name} {athlete.surname}
          </p>
          <p className="text-sm text-ink-muted truncate">{athlete.school}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <BeltBadge belt={lastAchievement.belt} size="sm" />
        <span className="text-xs text-ink-faint">{formatDate(lastAchievement.date)}</span>
      </div>
    </button>
  );
}
