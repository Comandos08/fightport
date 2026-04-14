import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('fp_lang', code);
  };

  const current = i18n.language?.startsWith('pt') ? 'pt-BR' : i18n.language;

  return (
    <div className="flex items-center" style={{ gap: 0 }}>
      {LANGS.map((lang, idx) => (
        <span key={lang.code} className="flex items-center" style={{ gap: 0 }}>
          <button
            onClick={() => handleChange(lang.code)}
            className="cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: current === lang.code ? 500 : 300,
              color: current === lang.code ? 'var(--color-text)' : 'var(--color-text-muted)',
              padding: '4px 6px',
              transition: 'var(--transition)',
              letterSpacing: '0.04em',
            }}
          >
            {lang.label}
          </button>
          {idx < LANGS.length - 1 && (
            <span style={{ color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 300, userSelect: 'none' }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
}
