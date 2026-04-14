import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="text-center">
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 48, color: 'var(--color-text)', marginBottom: 16 }}>{t('notFound.title')}</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 18, color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('notFound.message')}</p>
        <a href="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', textDecoration: 'underline' }}>{t('notFound.backHome')}</a>
      </div>
    </div>
  );
};

export default NotFound;
