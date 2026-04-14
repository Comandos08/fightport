import { useParams, Link } from 'react-router-dom';
import { Share2, QrCode, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSeo } from '@/hooks/useSeo';
import { QRCodeSVG } from 'qrcode.react';
import { NavbarPublic } from '@/components/layout/NavbarPublic';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { BeltBadge } from '@/components/BeltBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { getInitials, formatDate, beltColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function QrModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,25,35,0.5)', padding: 16 }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 32,
          maxWidth: 360,
          width: '100%',
          boxShadow: 'var(--shadow-float)',
          textAlign: 'center',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: 20 }}>QR CODE DO PASSAPORTE</h3>
        <div style={{ width: 192, height: 192, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QRCodeSVG value={url} size={192} />
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Escaneie para verificar</p>
        <button
          onClick={onClose}
          className="cursor-pointer"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 24px',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--blue-deep)',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-light)')}
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

  // Loading
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <NavbarPublic />
        <div style={{ paddingTop: 120, display: 'flex', justifyContent: 'center' }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: '4px solid var(--blue-deep)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  // Not found
  if (!practitioner) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <NavbarPublic />
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search style={{ width: 64, height: 64, color: 'var(--cloud)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>Atleta não encontrado</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--muted)', marginTop: 8 }}>Verifique o ID e tente novamente.</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: 24 }}>
            <button
              className="cursor-pointer"
              style={{
                background: 'var(--blue-deep)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 28px',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
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

  const ghostBtnStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1.5px solid var(--border-2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 20px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--blue-deep)',
    transition: 'var(--transition)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <NavbarPublic />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px' }}>
        {/* Verified badge */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <VerifiedBadge />
        </div>

        {/* Avatar */}
        <div style={{ textAlign: 'center' }}>
          {practitioner.photo_url ? (
            <img
              src={practitioner.photo_url}
              alt={fullName}
              style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--blue-light)', margin: '0 auto' }}
            />
          ) : (
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--terra-soft), var(--terra))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: '#ffffff',
            }}>
              {getInitials(practitioner.first_name, practitioner.last_name)}
            </div>
          )}

          {/* Name */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(28px, 4vw, 40px)',
            letterSpacing: '-0.025em',
            color: 'var(--ink)',
            marginTop: 20,
            marginBottom: 0,
          }}>
            {practitioner.first_name} {practitioner.last_name}
          </h1>

          {/* Modality + School */}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--muted)', marginTop: 8, marginBottom: 0 }}>
            {practitioner.martial_art} · {schoolData?.name}
          </p>

          {/* Head coach */}
          {headCoach && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>
              Graduado por {headCoach.name}, {headCoach.graduation}
            </p>
          )}
        </div>

        {/* Practitioner ID */}
        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          textAlign: 'center',
          margin: '28px 0',
        }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>ID do praticante: </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: 'var(--blue-deep)', letterSpacing: '0.04em' }}>{practitioner.fp_id}</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <button
            onClick={share}
            className="cursor-pointer"
            style={ghostBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Share2 style={{ width: 14, height: 14 }} />
            Compartilhar perfil
          </button>
          <button
            onClick={() => setShowQr(true)}
            className="cursor-pointer"
            style={ghostBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <QrCode style={{ width: 14, height: 14 }} />
            Ver QR Code
          </button>
        </div>

        {/* Timeline */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--muted)',
          marginBottom: 24,
        }}>
          JORNADA DO ATLETA
        </p>

        <div>
          {achievements.map((ach: any, idx: number) => {
            const hashPartial = ach.hash ? `${ach.hash.slice(0, 8)}...${ach.hash.slice(-8)}` : '';
            const isLast = idx === achievements.length - 1;
            return (
              <div key={ach.id} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 10, flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    backgroundColor: beltColor(ach.belt),
                    border: ach.belt === 'Branca' ? '1px solid var(--border-2)' : 'none',
                    flexShrink: 0,
                  }} />
                  {!isLast && (
                    <div style={{ width: 1, flexGrow: 1, background: 'var(--border-2)', marginTop: 4 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 11, color: 'var(--muted)' }}>{formatDate(ach.graduation_date)}</span>
                    <BeltBadge belt={ach.belt} size="sm" />
                    {idx === 0 && (
                      <span style={{
                        background: 'var(--terra)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 9,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}>
                        Mais recente
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', margin: '6px 0 4px' }}>Faixa {ach.belt}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', margin: 0 }}>{schoolData?.name} · {ach.graduated_by}</p>
                  <div style={{ marginTop: 4 }}>
                    <HashDisplay hashPartial={hashPartial} hashFull={ach.hash} showCopy />
                  </div>
                  {ach.notes && <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginTop: 8 }}>{ach.notes}</p>}
                </div>
              </div>
            );
          })}
          {achievements.length === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }}>Nenhuma conquista registrada ainda.</p>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-2)', padding: '24px 0', textAlign: 'center', marginTop: 48 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            Registro emitido por {schoolData?.name} via fightport.pro · SportCombat
          </p>
          <Link
            to="/#busca"
            style={{ display: 'inline-block', marginTop: 8, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, color: 'var(--blue-deep)', textDecoration: 'none' }}
          >
            Verificar outro atleta →
          </Link>
        </div>
      </div>

      {showQr && <QrModal url={window.location.href} onClose={() => setShowQr(false)} />}
    </div>
  );
}
