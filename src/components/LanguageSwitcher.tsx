import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'pt-BR', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = i18n.language?.startsWith('pt') ? 'pt-BR' : i18n.language;

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('fp_lang', code);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center"
        style={{
          gap: 4,
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          padding: '4px 6px',
          borderRadius: 'var(--radius-sm)',
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = 'var(--color-text-muted)'; }}
        aria-label="Language"
      >
        <Globe style={{ width: 16, height: 16 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.12)',
            minWidth: 140,
            padding: '4px 0',
            zIndex: 200,
          }}
        >
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className="cursor-pointer w-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: current === lang.code ? 'var(--color-bg-soft)' : 'transparent',
                border: 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: current === lang.code ? 500 : 400,
                color: current === lang.code ? 'var(--color-text)' : 'var(--color-text-muted)',
                textAlign: 'left',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-bg-soft)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
              onMouseLeave={e => {
                if (current !== lang.code) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
