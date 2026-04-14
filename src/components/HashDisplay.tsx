import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface HashDisplayProps {
  hashPartial: string;
  hashFull: string;
  showCopy?: boolean;
}

export function HashDisplay({ hashPartial, hashFull, showCopy = false }: HashDisplayProps) {
  const copy = () => {
    navigator.clipboard.writeText(hashFull);
    toast.success('Hash copiada para a área de transferência');
  };

  return (
    <div className="inline-flex items-center group" style={{ gap: 8 }} title="Hash de verificação — compare com o certificado físico">
      <span style={{ fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)', fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.04em' }}>{hashPartial}</span>
      {showCopy && (
        <button
          onClick={copy}
          className="opacity-0 group-hover:opacity-100 cursor-pointer"
          style={{ background: 'none', border: 'none', transition: 'var(--transition)' }}
          aria-label="Copiar hash completa"
        >
          <Copy style={{ width: 12, height: 12, color: 'var(--color-text-muted)' }} />
        </button>
      )}
    </div>
  );
}
