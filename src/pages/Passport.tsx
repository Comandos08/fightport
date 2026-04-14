import { useParams, Link } from 'react-router-dom';
import { Share2, QrCode, Search, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { QRCodeSVG } from 'qrcode.react';
import { BeltBadge } from '@/components/BeltBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { getInitials, formatDate, beltColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function QrModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', padding: 16 }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: 40,
          maxWidth: 320,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)', marginBottom: 24 }}>QR Code</h3>
        <div style={{ width: 192, height: 192, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QRCodeSVG value={url} size={192} />
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginTop: 16 }}>Escaneie para verificar</p>
        <button
          onClick={onClose}
          className="cursor-pointer"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 20px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 400,
            fontSize: 14,
            color: 'var(--color-text-muted)',
            transition: 'var(--transition)',
            marginTop: 20,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function PassportPage() {
  const { id } = useParams<{ id: string }>();
  const [showQr, setShowQr] = useState(false);

  const { data: practitioner, isLoading } = useQuery({
    queryKey: ['public-practitioner', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('practitioners')
        .select('*, schools(name, martial_art)')
        .eq('fp_id', id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['public-achievements', practitioner?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('practitioner_id', practitioner!.id)
        .order('graduation_date', { ascending: false });
      return data ?? [];
    },
    enabled: !!practitioner?.id,
  });

  const { data: headCoach } = useQuery({
    queryKey: ['public-head-coach', practitioner?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('head_coaches')
        .select('name, graduation')
        .eq('school_id', practitioner!.school_id)
        .single();
      return data;
    },
    enabled: !!practitioner?.school_id,
  });

  const schoolData = practitioner?.schools as any;
  const fullName = practitioner ? `${practitioner.first_name} ${practitioner.last_name}` : '';
  const pageTitle = practitioner
    ? `${fullName} — Passaporte ${practitioner.martial_art} | fightport.pro`
    : 'Carregando... | fightport.pro';
  const pageDescription = practitioner
    ? `Passaporte verificado de ${fullName}. ${practitioner.martial_art} na ${schoolData?.name}. Graduações autenticadas com hash SHA-256.`
    : 'Carregando passaporte do praticante...';
  const pageUrl = practitioner ? `https://fightport.lovable.app/p/${practitioner.fp_id}` : '';

  const jsonLd = practitioner ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: fullName,
    url: pageUrl,
    description: pageDescription,
    memberOf: {
      '@type': 'SportsOrganization',
      name: schoolData?.name,
      sport: practitioner.martial_art,
    },
    ...(practitioner.current_belt && {
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        name: `Faixa ${practitioner.current_belt} — ${practitioner.martial_art}`,
        credentialCategory: 'Belt Rank',
      },
    }),
  } : undefined;

  useSeo({
    title: pageTitle,
    description: pageDescription,
    url: pageUrl || undefined,
    image: practitioner?.photo_url ?? undefined,
    type: 'profile',
    jsonLd,
  });

  // Header component
  const Header = () => (
    <header
      style={{
        height: 60,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        className="fp-container flex items-center justify-between"
        style={{ height: '100%' }}
      >
        <Link to="/" className="no-underline">
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)' }}>fightport.pro</span>
        </Link>
        <Link
          to="/#busca"
          style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'none', transition: 'var(--transition)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
        >
          Verificar outro atleta
        </Link>
      </div>
    </header>
  );

  // Loading
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Header />
        <div style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--color-text)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  // Not found
  if (!practitioner) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Header />
        <div style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 28, color: 'var(--color-text)', marginBottom: 8 }}>Atleta não encontrado</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--color-text-muted)' }}>Verifique o ID e tente novamente.</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: 28 }}>
            <button
              className="cursor-pointer"
              style={{
                background: 'var(--color-bg-amber)',
                color: 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 24px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                fontSize: 14,
                transition: 'var(--transition)',
              }}
            >
              Voltar ao início
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const share = () => {
    const ogUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-passport?id=${practitioner.fp_id}`;
    navigator.clipboard.writeText(ogUrl);
    toast.success('Link otimizado copiado para a área de transferência');
  };

  const actionBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 20px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 400,
    fontSize: 14,
    color: 'var(--color-text-muted)',
    transition: 'var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 80px' }}>
        {/* Verified badge */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-muted)',
          }}>
            <CheckCircle style={{ width: 16, height: 16 }} />
            VERIFICADO POR FIGHTPORT.PRO
          </span>
        </div>

        {/* Avatar */}
        <div style={{ textAlign: 'center' }}>
          {practitioner.photo_url ? (
            <img
              src={practitioner.photo_url}
              alt={fullName}
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)', margin: '0 auto' }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--color-bg-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 24, color: 'var(--color-text-muted)',
            }}>
              {getInitials(practitioner.first_name, practitioner.last_name)}
            </div>
          )}

          {/* Name */}
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 52px)',
            letterSpacing: '-0.025em',
            color: 'var(--color-text)',
            marginTop: 20,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            {practitioner.first_name} {practitioner.last_name}
          </h1>

          {/* Modality + School */}
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: 'var(--color-text-muted)', marginTop: 0, marginBottom: 0 }}>
            {practitioner.martial_art} · {schoolData?.name}
          </p>

          {/* Head coach */}
          {headCoach && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Graduado por {headCoach.name}
            </p>
          )}
        </div>

        {/* Practitioner ID */}
        <div style={{
          background: 'var(--color-bg-soft)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 20px',
          textAlign: 'center',
          marginTop: 32,
        }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>ID do praticante: </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: 'var(--color-text)' }}>{practitioner.fp_id}</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
          <button
            onClick={share}
            className="cursor-pointer"
            style={actionBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-soft)'; e.currentTarget.style.borderColor = 'var(--color-border-dark)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <Share2 style={{ width: 14, height: 14 }} />
            Compartilhar perfil
          </button>
          <button
            onClick={() => setShowQr(true)}
            className="cursor-pointer"
            style={actionBtnStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-soft)'; e.currentTarget.style.borderColor = 'var(--color-border-dark)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <QrCode style={{ width: 14, height: 14 }} />
            Ver QR Code
          </button>
        </div>

        {/* Timeline */}
        <div style={{ paddingTop: 48 }}>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 500,
            fontSize: 20,
            color: 'var(--color-text)',
            marginBottom: 32,
          }}>
            Jornada do atleta
          </h2>

          <div>
            {achievements.map((ach: any, idx: number) => {
              const hashPartial = ach.hash ? `${ach.hash.slice(0, 8)}...${ach.hash.slice(-8)}` : '';
              const isLast = idx === achievements.length - 1;
              return (
                <div key={ach.id} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
                  {/* Dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flexShrink: 0 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      backgroundColor: beltColor(ach.belt),
                      border: ach.belt === 'Branca' ? '1px solid var(--color-border)' : 'none',
                      flexShrink: 0,
                      marginTop: 6,
                    }} />
                    {!isLast && (
                      <div style={{ width: 1, flexGrow: 1, background: 'var(--color-border)', marginTop: 4 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>{formatDate(ach.graduation_date)}</span>
                      <BeltBadge belt={ach.belt} size="sm" />
                      {idx === 0 && (
                        <span style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 500,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          color: 'var(--color-bg-amber)',
                        }}>
                          Mais recente
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 16, color: 'var(--color-text)', margin: '0 0 4px' }}>Faixa {ach.belt}</p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>{schoolData?.name} · {ach.graduated_by}</p>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#9A9A9A' }}>
                        {hashPartial}
                      </span>
                    </div>
                    {ach.notes && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 8 }}>{ach.notes}</p>}
                  </div>
                </div>
              );
            })}
            {achievements.length === 0 && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>Nenhuma conquista registrada ainda.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E8E8E5', padding: '32px 0', textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#9A9A9A', margin: 0 }}>
            Registro emitido por {schoolData?.name} via fightport.pro · SportCombat
          </p>
          <Link
            to="/#busca"
            style={{ display: 'block', marginTop: 8, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: '#1C1C1C', textDecoration: 'none' }}
          >
            Verificar outro atleta →
          </Link>
        </div>
      </div>

      {showQr && <QrModal url={window.location.href} onClose={() => setShowQr(false)} />}
    </div>
  );
}
