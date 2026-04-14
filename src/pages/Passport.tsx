import { useParams, Link } from 'react-router-dom';
import { Share2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { NavbarPublic } from '@/components/layout/NavbarPublic';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { BeltBadge } from '@/components/BeltBadge';
import { HashDisplay } from '@/components/HashDisplay';
import { Button } from '@/components/ui/button';
import { getInitials, formatDate, beltColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function QrModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-main rounded-xl p-8 shadow-card max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-lg text-ink mb-4" style={{ letterSpacing: '0.02em' }}>QR Code do Passaporte</h3>
        <div className="w-48 h-48 mx-auto border-2 rounded-lg flex items-center justify-center mb-4" style={{ borderColor: 'var(--color-border)' }}>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-sm ${Math.random() > 0.4 ? 'bg-ink' : 'bg-surface'}`} />
            ))}
          </div>
        </div>
        <p className="font-body text-sm text-ink-muted mb-4">Escaneie para verificar</p>
        <Button variant="ghost" onClick={onClose}>Fechar</Button>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-main">
        <NavbarPublic />
        <div className="pt-28 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent-brand border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!practitioner) {
    return (
      <div className="min-h-screen bg-main">
        <NavbarPublic />
        <div className="pt-28 text-center">
          <h1 className="font-display font-bold text-2xl text-ink mb-2" style={{ letterSpacing: '0.02em' }}>Atleta não encontrado</h1>
          <p className="font-body text-ink-muted">Verifique o ID e tente novamente.</p>
          <Link to="/" className="mt-4 inline-block">
            <Button variant="default">Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const schoolData = practitioner.schools as any;
  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência');
  };

  return (
    <div className="min-h-screen bg-main">
      <NavbarPublic />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex justify-center mb-8">
            <VerifiedBadge />
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 font-display font-bold text-xl" style={{ backgroundColor: '#C9A84C', color: '#FFFFFF' }}>
              {getInitials(practitioner.first_name, practitioner.last_name)}
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-ink" style={{ letterSpacing: '0.02em' }}>
              {practitioner.first_name} {practitioner.last_name}
            </h1>
            <p className="font-body text-ink-muted mt-1">
              {practitioner.martial_art} · {schoolData?.name}
            </p>
            {headCoach && (
              <p className="font-body text-sm text-ink-faint mt-1">
                Graduado por {headCoach.name}, {headCoach.graduation}
              </p>
            )}
          </div>

          <div className="text-center mb-10 p-3 rounded-lg bg-surface">
            <span className="font-body text-xs text-ink-faint">ID do praticante: </span>
            <span className="font-mono-hash text-xs text-ink-faint">{practitioner.fp_id}</span>
          </div>

          <div className="flex justify-center gap-3 mb-12">
            <Button variant="ghost" onClick={share}>
              <Share2 className="h-4 w-4" />
              Compartilhar perfil
            </Button>
            <Button variant="ghost" onClick={() => setShowQr(true)}>
              <QrCode className="h-4 w-4" />
              Ver QR Code
            </Button>
          </div>

          <h2 className="font-display font-bold text-lg text-ink uppercase tracking-wide mb-8" style={{ letterSpacing: '0.02em' }}>
            Jornada do Atleta
          </h2>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="flex flex-col gap-8">
              {achievements.map((ach: any, idx: number) => {
                const hashPartial = ach.hash ? `${ach.hash.slice(0, 8)}...${ach.hash.slice(-8)}` : '';
                return (
                  <div key={ach.id} className="relative pl-12">
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full border-2" style={{ backgroundColor: beltColor(ach.belt), borderColor: ach.belt === 'Branca' ? 'var(--color-border)' : beltColor(ach.belt) }} />
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-body text-xs text-ink-faint">{formatDate(ach.graduation_date)}</span>
                      <BeltBadge belt={ach.belt} size="sm" />
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-body font-medium bg-accent text-accent-foreground">Mais recente</span>
                      )}
                    </div>
                    <h3 className="font-body font-medium text-base text-ink">Faixa {ach.belt}</h3>
                    <p className="font-body text-sm text-ink-muted">{schoolData?.name} · {ach.graduated_by}</p>
                    <HashDisplay hashPartial={hashPartial} hashFull={ach.hash} showCopy />
                    {ach.notes && <p className="font-body text-sm text-ink-muted italic mt-2">{ach.notes}</p>}
                  </div>
                );
              })}
              {achievements.length === 0 && (
                <p className="pl-12 font-body text-sm text-ink-muted">Nenhuma conquista registrada ainda.</p>
              )}
            </div>
          </div>

          <div className="mt-16 text-center border-t pt-8" style={{ borderColor: 'var(--color-border)' }}>
            <p className="font-body text-sm text-ink-faint">
              Registro emitido por {schoolData?.name} via fightport.pro · SportCombat
            </p>
            <Link to="/#busca" className="inline-block mt-2 font-body text-sm text-ink-muted hover:text-ink transition-colors">
              Verificar outro atleta →
            </Link>
          </div>
        </div>
      </div>

      {showQr && <QrModal onClose={() => setShowQr(false)} />}
    </div>
  );
}
