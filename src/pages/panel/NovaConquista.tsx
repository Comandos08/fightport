import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const inputStyle: React.CSSProperties = {
  background: 'var(--white)',
  border: '1.5px solid var(--border-2)',
  borderRadius: 'var(--radius-sm)',
  padding: '11px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  width: '100%',
  transition: 'var(--transition)',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--blue-mid)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88,131,154,0.15)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--border-2)';
  e.currentTarget.style.boxShadow = 'none';
};

export default function NovaConquistaPage() {
  const { user } = useAuth();
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

  const { data: _headCoach } = useQuery({
    queryKey: ['head-coach', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('head_coaches').select('name').eq('school_id', user!.id).single();
      if (data) setGraduatedBy(`Prof. ${data.name}`);
      return data;
    },
    enabled: !!user,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ['search-practitioners', user?.id, searchText],
    queryFn: async () => {
      if (searchText.length < 3) return [];
      const { data } = await supabase
        .from('practitioners')
        .select('*')
        .eq('school_id', user!.id)
        .or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%`)
        .limit(10);
      return data ?? [];
    },
    enabled: !!user && searchText.length >= 3,
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
      toast.error(error.message.includes('insuficiente') ? 'Saldo de créditos insuficiente.' : error.message);
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
      <div style={{ padding: '24px 32px', maxWidth: 600 }}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle style={{ width: 32, height: 32, color: 'var(--blue-deep)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 8 }}>Conquista registrada!</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>A graduação foi registrada com sucesso.</p>

          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 24, textAlign: 'left', maxWidth: 440, margin: '0 auto 24px' }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--cloud)', display: 'block', marginBottom: 4 }}>Hash de verificação</label>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
              <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 11, color: 'var(--ink)', wordBreak: 'break-all', flex: 1 }}>{generatedHash}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedHash); toast.success('Hash copiada'); }} className="shrink-0 cursor-pointer" style={{ background: 'none', border: 'none' }} aria-label="Copiar hash">
                <Copy style={{ width: 16, height: 16, color: 'var(--cloud)', transition: 'var(--transition)' }} />
              </button>
            </div>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
            Cole a hash no certificado físico da sua academia.
          </p>

          <div className="flex flex-col sm:flex-row justify-center" style={{ gap: 12 }}>
            {selectedPractitioner && (
              <Link to={`/p/${selectedPractitioner.fp_id}`}>
                <Button variant="ghost">Ver passaporte do atleta</Button>
              </Link>
            )}
            <Button onClick={() => { setShowSuccess(false); setSelectedPractitioner(null); setBelt(''); setSearchText(''); setNote(''); }}>
              Registrar outra conquista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = selectedPractitioner && belt && date && balance > 0;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 24 }}>Registrar Conquista</h1>

      {/* Credit banner */}
      <div
        style={{
          background: 'var(--blue-light)',
          border: '1px solid var(--blue-mid)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: 24,
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--blue-deep)',
        }}
      >
        Você tem {balance} créditos disponíveis. Cada graduação consome 1 crédito.
      </div>

      {balance === 0 && (
        <div style={{ border: '2px solid var(--blue-deep)', borderRadius: 'var(--radius-md)', padding: 24, textAlign: 'center', marginBottom: 24, background: 'var(--blue-light)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--blue-deep)', marginBottom: 8 }}>Sem créditos disponíveis.</p>
          <Link to="/painel/creditos"><Button size="sm">Comprar créditos</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 32 }}>
        <div className="lg:col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Athlete search */}
          <div className="relative">
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Praticante</label>
            {selectedPractitioner ? (
              <div className="flex items-center" style={{ ...inputStyle, height: 44, display: 'flex', gap: 12, background: 'var(--bg-2)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-deep)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10 }}>
                  {getInitials(selectedPractitioner.first_name, selectedPractitioner.last_name)}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>{selectedPractitioner.first_name} {selectedPractitioner.last_name}</span>
                <button onClick={() => { setSelectedPractitioner(null); setSearchText(''); }} className="ml-auto cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--cloud)', fontSize: 12 }}>✕</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, width: 16, height: 16, color: 'var(--cloud)' }} />
                  <input value={searchText} onChange={e => setSearchText(e.target.value)} style={{ ...inputStyle, height: 44, paddingLeft: 40 }} placeholder="Buscar por nome (mín. 3 letras)..." onFocus={focusInput} onBlur={blurInput} />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full" style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-card)' }}>
                    {searchResults.map(a => (
                      <button key={a.id} onClick={() => { setSelectedPractitioner(a); setSearchText(''); }} className="flex items-center w-full cursor-pointer" style={{ gap: 12, padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', transition: 'var(--transition)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-deep)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10 }}>
                          {getInitials(a.first_name, a.last_name)}
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)' }}>{a.first_name} {a.last_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Faixa</label>
            <select value={belt} onChange={e => setBelt(e.target.value as Belt)} style={{ ...inputStyle, height: 44 }} onFocus={focusInput as any} onBlur={blurInput as any}>
              <option value="">Selecione a faixa</option>
              <option>Branca</option><option>Azul</option><option>Roxa</option><option>Marrom</option><option>Preta</option><option>Vermelha</option>
            </select>
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Data da graduação</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, height: 44 }} onFocus={focusInput} onBlur={blurInput} />
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Quem graduou</label>
            <input value={graduatedBy} onChange={e => setGraduatedBy(e.target.value)} style={{ ...inputStyle, height: 44 }} onFocus={focusInput} onBlur={blurInput} />
          </div>

          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Texto complementar (opcional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none', padding: '12px 14px' }} placeholder="Ex: Promovido a Faixa Azul..." onFocus={focusInput as any} onBlur={blurInput as any} />
          </div>

          <button
            disabled={!canSubmit}
            onClick={() => setShowConfirm(true)}
            style={{
              background: canSubmit ? 'var(--blue-deep)' : 'var(--cloud)',
              color: '#ffffff',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '15px 28px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'var(--transition)',
              width: 'fit-content',
            }}
          >
            Registrar conquista
          </button>
        </div>

        <div className="lg:col-span-2">
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 12 }}>Preview</p>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
            {selectedPractitioner && belt ? (
              <>
                <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--blue-deep)' }} />
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--blue-deep)' }}>Verificado</span>
                </div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>{selectedPractitioner.first_name} {selectedPractitioner.last_name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', margin: '2px 0 12px' }}>{school?.name}</p>
                <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
                  <BeltBadge belt={belt as any} size="sm" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--cloud)' }}>{date ? formatDate(date) : ''}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', margin: 0 }}>{graduatedBy}</p>
                {note && <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 8 }}>{note}</p>}
              </>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--cloud)', textAlign: 'center', padding: '32px 0' }}>Selecione um atleta e faixa para ver o preview</p>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,25,35,0.5)', padding: 16 }} onClick={() => setShowConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: 24, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-float)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>Confirmar registro</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
              Isso consumirá 1 crédito do seu saldo ({balance} restantes). Confirmar?
            </p>
            <div className="flex justify-end" style={{ gap: 12 }}>
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button onClick={handleConfirm} disabled={loading}>{loading ? 'Registrando...' : 'Confirmar'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
