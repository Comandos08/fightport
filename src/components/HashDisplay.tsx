import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface HashDisplayProps {
  hashPartial: string;
  hashFull: string;
  showCopy?: boolean;
}

export function HashDisplay({ hashPartial, hashFull, showCopy = false }: HashDisplayProps) {
  const { t } = useTranslation();
  const copy = () => {
    navigator.clipboard.writeText(hashFull);
    toast.success(t('achievement.success.hashCopied'));
  };

  return (
    <div className="inline-flex items-center group" style={{ gap: 8 }} title={t('achievement.success.hashLabel')}>
      <span style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)', fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.04em' }}>{hashPartial}</span>
      {showCopy && (
        <button onClick={copy} className="opacity-0 group-hover:opacity-100 cursor-pointer" style={{ background: 'none', border: 'none', transition: 'var(--transition)' }} aria-label={t('achievement.success.hashLabel')}>
          <Copy style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
        </button>
      )}
    </div>
  );
}
