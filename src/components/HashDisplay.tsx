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
    <div className="inline-flex items-center gap-2 group" title="Hash de verificação — compare com o certificado físico">
      <span className="font-mono-hash text-xs text-ink-faint">{hashPartial}</span>
      {showCopy && (
        <button
          onClick={copy}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Copiar hash completa"
        >
          <Copy className="h-3 w-3 text-ink-faint" />
        </button>
      )}
    </div>
  );
}
