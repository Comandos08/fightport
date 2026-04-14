import { useNavigate } from 'react-router-dom';
import type { Athlete } from '@/lib/mock-data';
import { getInitials, formatDate } from '@/lib/utils';
import { BeltBadge } from './BeltBadge';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AthleteCardProps {
  athlete: Athlete;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lastAchievement = athlete.achievements[athlete.achievements.length - 1];

  return (
    <button
      onClick={() => navigate(`/p/${athlete.publicId}`)}
      className="cursor-pointer w-full"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 20, textAlign: 'left', transition: 'var(--transition)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div className="flex items-center w-full" style={{ gap: 12, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-text)', color: '#FFFFFF', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 13, flexShrink: 0 }}>
          {getInitials(athlete.name, athlete.surname)}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{athlete.name} {athlete.surname}</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{athlete.school}</p>
        </div>
      </div>
      <div style={{ width: '100%', height: 1, background: 'var(--color-border)', marginBottom: 16 }} />
      <div className="flex items-center justify-between w-full" style={{ marginBottom: 12 }}>
        <BeltBadge belt={lastAchievement.belt} size="sm" />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>{formatDate(lastAchievement.date)}</span>
      </div>
      <div className="flex items-center" style={{ gap: 6 }}>
        <CheckCircle style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-muted)' }}>{t('passport.certifiedBy')}</span>
      </div>
    </button>
  );
}
