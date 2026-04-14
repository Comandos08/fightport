import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { CreditBalance } from '@/components/CreditBalance';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getInitials, formatDate } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type Belt = 'Branca' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta' | 'Vermelha';

export default function NovaConquistaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [selectedPractitioner, setSelectedPractitioner] = useState<Tables<'practitioners'> | null>(null);
  const [belt, setBelt] = useState<Belt | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [graduatedBy, setGraduatedBy] = useState('');
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedHash, setGeneratedHash] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: credits } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('credits').select('balance').eq('school_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: school } = useQuery({
    queryKey: ['school-full', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('name').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useQuery({
    queryKey: ['head-coach', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('head_coaches').select('name').eq('school_id', user!.id).single();
      if (data && !graduatedBy) setGraduatedBy(`Prof. ${data.name}`);
      return data;
    },
    enabled: !!user,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['search-practitioners', user?.id, searchText],
    queryFn: async () => {
      if (searchText.length < 2) return [];
      const { data } = await supabase
        .from('practitioners')
        .select('*')
        .eq('school_id', user!.id)
        .or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%`)
        .limit(10);
      return data ?? [];
    },
    enabled: !!user && searchText.length >= 2,
  });

  const balance = credits?.balance ?? 0;

  const handleConfirm = async () => {
    if (!selectedPractitioner || !belt || !date) return;
    setLoading(true);

    const { data: hash, error: hashError } = await supabase.rpc('generate_achievement_hash', {
      p_fp_id: selectedPractitioner.fp_id,
      p_belt: belt,
      p_date: date,
      p_school: school?.name ?? '',
      p_professor: graduatedBy,
    });

    if (hashError || !hash) {
      toast.error('Erro ao gerar hash.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('achievements').insert({
      practitioner_id: selectedPractitioner.id,
      school_id: user!.id,
      belt,
      graduation_date: date,
      graduated_by: graduatedBy,
      notes: note || null,
      hash,
    });

    setLoading(false);
    setShowConfirm(false);

    if (error) {
      if (error.message.includes('insuficiente')) {
        toast.error('Saldo de créditos insuficiente. Compre mais créditos para continuar.');
      } else {
        toast.error(error.message);
      }
    } else {
      setGeneratedHash(hash);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['recent-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievement-count'] });
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    }
  };

  if (showSuccess) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-verified flex items-center justify-center">
            <CheckCircle className="h-8 w-8" style={{ color: 'var(--color-verified)' }} />
          </div>
          <h1 className="font-display font-bold text-2xl text-ink mb-2" style={{ letterSpacing: '0.02em' }}>Conquista registrada!</h1>
          <p className="font-body text-ink-muted mb-8">A graduação foi registrada com sucesso e 1 crédito foi debitado.</p>

          <div className="rounded-xl border p-6 mb-6 text-left bg-main shadow-card max-w-md mx-auto" style={{ borderColor: 'var(--color-border)' }}>
            <label className="font-body text-xs text-ink-faint block mb-1">Hash de verificação (SHA-256)</label>
            <div className="flex items-center gap-2 mb-4">
              <code className="font-mono-hash text-xs text-ink break-all flex-1">{generatedHash}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedHash); toast.success('Hash copiada!'); }} className="shrink-0 cursor-pointer" aria-label="Copiar hash">
                <Copy className="h-4 w-4 text-ink-faint hover:text-ink transition-colors" />
              </button>
            </div>
            <p className="font-body text-xs text-ink-faint">Cole esta hash no certificado físico da academia para garantir a autenticidade.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => selectedPractitioner && navigate(`/p/${selectedPractitioner.fp_id}`)}>
              Ver passaporte do atleta
            </Button>
            <Button variant="ghost" onClick={() => {
              setShowSuccess(false);
              setSelectedPractitioner(null);
              setBelt('');
              setSearchText('');
              setNote('');
              setGeneratedHash('');
            }}>
              Registrar outra conquista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = selectedPractitioner && belt && date && balance > 0;

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-6" style={{ letterSpacing: '0.02em' }}>Registrar Conquista</h1>

      <div className="mb-6">
        <CreditBalance balance={balance} />
        {balance === 0 && (
          <div className="mt-4 rounded-xl border-2 p-4 text-center" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(200,241,53,0.08)' }}>
            <p className="font-body text-sm font-medium text-ink mb-1">Sem créditos disponíveis</p>
            <p className="font-body text-xs text-ink-muted mb-3">Você precisa de pelo menos 1 crédito para registrar uma conquista.</p>
            <Link to="/painel/creditos"><Button size="sm">Comprar créditos</Button></Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {/* Athlete search */}
          <div className="relative">
            <label className="font-body text-sm text-ink-muted block mb-1.5">Praticante</label>
            {selectedPractitioner ? (
              <div className="flex items-center gap-3 h-12 px-4 rounded-lg border bg-surface" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                  {getInitials(selectedPractitioner.first_name, selectedPractitioner.last_name)}
                </div>
                <span className="font-body text-sm text-ink">{selectedPractitioner.first_name} {selectedPractitioner.last_name}</span>
                {selectedPractitioner.current_belt && (
                  <BeltBadge belt={selectedPractitioner.current_belt as any} size="sm" />
                )}
                <button onClick={() => { setSelectedPractitioner(null); setSearchText(''); }} className="ml-auto text-ink-faint hover:text-ink text-xs cursor-pointer">✕</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                  <input
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border bg-popover font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none transition-all"
                    style={{ borderColor: 'var(--color-border)' }}
                    placeholder="Buscar por nome (mín. 2 letras)..."
                    disabled={balance === 0}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-card" style={{ borderColor: 'var(--color-border)' }}>
                    {searchResults.map(a => (
                      <button key={a.id} onClick={() => { setSelectedPractitioner(a); setSearchText(''); }} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface transition-colors cursor-pointer text-left">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                          {getInitials(a.first_name, a.last_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-body text-sm text-ink block">{a.first_name} {a.last_name}</span>
                          <span className="font-body text-xs text-ink-faint">{a.fp_id}</span>
                        </div>
                        {a.current_belt && <BeltBadge belt={a.current_belt as any} size="sm" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Faixa</label>
            <select value={belt} onChange={e => setBelt(e.target.value as Belt)} disabled={balance === 0} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
              <option value="">Selecione a faixa</option>
              <option>Branca</option>
              <option>Azul</option>
              <option>Roxa</option>
              <option>Marrom</option>
              <option>Preta</option>
              <option>Vermelha</option>
            </select>
          </div>

          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Data da graduação</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={balance === 0} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} />
          </div>

          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Quem graduou</label>
            <input value={graduatedBy} onChange={e => setGraduatedBy(e.target.value)} disabled={balance === 0} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} />
          </div>

          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Texto complementar (opcional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} disabled={balance === 0} className="w-full px-4 py-3 rounded-lg border bg-popover font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none transition-all resize-none" style={{ borderColor: 'var(--color-border)' }} placeholder="Ex: Promovido a Faixa Azul pelo cumprimento de todos os requisitos técnicos..." />
          </div>

          <Button disabled={!canSubmit} className="w-full sm:w-auto" size="lg" onClick={() => setShowConfirm(true)}>
            Registrar conquista (1 crédito)
          </Button>
        </div>

        <div className="lg:col-span-2">
          <p className="font-body text-xs text-ink-faint uppercase tracking-wide mb-3">Preview</p>
          <div className="rounded-xl border p-5 bg-main shadow-card" style={{ borderColor: 'var(--color-border)' }}>
            {selectedPractitioner && belt ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-verified" />
                  <span className="text-xs font-body font-medium text-verified">Verificado</span>
                </div>
                <p className="font-display font-bold text-sm text-ink">{selectedPractitioner.first_name} {selectedPractitioner.last_name}</p>
                <p className="font-body text-xs text-ink-muted mb-3">{school?.name}</p>
                <div className="flex items-center gap-2 mb-2">
                  <BeltBadge belt={belt as any} size="sm" />
                  <span className="font-body text-xs text-ink-faint">{date ? formatDate(date) : ''}</span>
                </div>
                <p className="font-body text-xs text-ink-muted">{graduatedBy}</p>
                {note && <p className="font-body text-xs text-ink-muted italic mt-2">{note}</p>}
                <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="font-body text-xs text-ink-faint">ID: {selectedPractitioner.fp_id}</p>
                </div>
              </>
            ) : (
              <p className="font-body text-sm text-ink-faint text-center py-8">Selecione um atleta e faixa para ver o preview</p>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-main rounded-xl p-6 shadow-card max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-ink mb-2" style={{ letterSpacing: '0.02em' }}>Confirmar registro</h3>
            <p className="font-body text-sm text-ink-muted mb-4">
              Isso consumirá <strong>1 crédito</strong> do seu saldo ({balance} restantes). Essa ação é irreversível.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? 'Registrando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
