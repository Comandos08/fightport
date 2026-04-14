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
import { useTranslation } from 'react-i18next';

type Belt = 'Branca' | 'Cinza' | 'Amarela' | 'Laranja' | 'Verde' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta' | 'Preta 1º Grau' | 'Preta 2º Grau' | 'Preta 3º Grau' | 'Preta 4º Grau' | 'Preta 5º Grau' | 'Preta 6º Grau' | 'Preta 7º Grau' | 'Preta 8º Grau' | 'Preta 9º Grau';

const inputStyle: React.CSSProperties = { background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '13px 16px', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)', outline: 'none', width: '100%', transition: 'var(--transition)' };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, letterSpacing: '0.01em', color: 'var(--color-text)', display: 'block', marginBottom: 6 };
const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = '#9A9A9A'; e.currentTarget.style.background = 'var(--color-bg)'; };
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; };

export default function NovaConquistaPage() {
  const { t } = useTranslation();
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

  const { data: credits } = useQuery({ queryKey: ['credits', user?.id], queryFn: async () => { const { data } = await supabase.from('credits').select('balance').eq('school_id', user!.id).single(); return data; }, enabled: !!user });
  const { data: school } = useQuery({ queryKey: ['school-full', user?.id], queryFn: async () => { const { data } = await supabase.from('schools').select('name').eq('id', user!.id).single(); return data; }, enabled: !!user });
  const { data: _headCoach } = useQuery({ queryKey: ['head-coach', user?.id], queryFn: async () => { const { data } = await supabase.from('head_coaches').select('name').eq('school_id', user!.id).single(); if (data) setGraduatedBy(`Prof. ${data.name}`); return data; }, enabled: !!user });
  const { data: searchResults = [] } = useQuery({ queryKey: ['search-practitioners', user?.id, searchText], queryFn: async () => { if (searchText.length < 3) return []; const { data } = await supabase.from('practitioners').select('*').eq('school_id', user!.id).or(`first_name.ilike.%${searchText}%,last_name.ilike.%${searchText}%`).limit(10); return data ?? []; }, enabled: !!user && searchText.length >= 3 });

  const balance = credits?.balance ?? 0;

  const handleConfirm = async () => {
    if (!selectedPractitioner || !belt || !date) return;
    setLoading(true);
    const { data: hash, error: hashError } = await supabase.rpc('generate_achievement_hash', { p_fp_id: selectedPractitioner.fp_id, p_belt: belt, p_date: date, p_school: school?.name ?? '', p_professor: graduatedBy });
    if (hashError || !hash) { toast.error('Erro ao gerar hash.'); setLoading(false); return; }
    const { error } = await supabase.from('achievements').insert({ practitioner_id: selectedPractitioner.id, school_id: user!.id, belt, graduation_date: date, graduated_by: graduatedBy, notes: note || null, hash });
    setLoading(false); setShowConfirm(false);
    if (error) { toast.error(error.message.includes('insuficiente') ? 'Saldo de créditos insuficiente.' : error.message); } else { setGeneratedHash(hash); setShowSuccess(true); queryClient.invalidateQueries({ queryKey: ['credits'] }); queryClient.invalidateQueries({ queryKey: ['recent-achievements'] }); queryClient.invalidateQueries({ queryKey: ['achievement-count'] }); queryClient.invalidateQueries({ queryKey: ['practitioners'] }); }
  };

  if (showSuccess) {
    return (
      <div style={{ padding: '32px 32px', maxWidth: 600 }}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle style={{ width: 32, height: 32, color: '#2D6A4F' }} /></div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 24, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 8 }}>{t('achievement.success.title')}</h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 32 }}>{t('achievement.success.desc')}</p>
          <div style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24, marginBottom: 24, textAlign: 'left', maxWidth: 440, margin: '0 auto 24px' }}>
            <label style={labelStyle}>{t('achievement.success.hashLabel')}</label>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
              <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 11, color: 'var(--color-text)', wordBreak: 'break-all', flex: 1 }}>{generatedHash}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedHash); toast.success(t('achievement.success.hashCopied')); }} className="shrink-0 cursor-pointer" style={{ background: 'none', border: 'none' }}><Copy style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} /></button>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>{t('achievement.success.hashHint')}</p>
          <div className="flex flex-col sm:flex-row justify-center" style={{ gap: 12 }}>
            {selectedPractitioner && <Link to={`/p/${selectedPractitioner.fp_id}`}><Button variant="ghost">{t('achievement.success.viewPassport')}</Button></Link>}
            <Button onClick={() => { setShowSuccess(false); setSelectedPractitioner(null); setBelt(''); setSearchText(''); setNote(''); }}>{t('achievement.success.registerAnother')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = selectedPractitioner && belt && date && balance > 0;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 28, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 32 }}>{t('achievement.title')}</h1>
      <div style={{ background: 'var(--color-bg-soft)', borderBottom: '1px solid var(--color-border)', padding: '14px 24px', marginBottom: 24, fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 14, color: 'var(--color-text-muted)' }}>{t('achievement.creditInfo', { balance })}</div>
      {balance === 0 && (<div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24, textAlign: 'center', marginBottom: 24, background: 'var(--color-bg-soft)' }}><p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)', marginBottom: 8 }}>{t('achievement.noCredits')}</p><Link to="/painel/creditos"><Button size="sm">{t('achievement.buyCredits')}</Button></Link></div>)}
      <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 32 }}>
        <div className="lg:col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="relative">
            <label style={labelStyle}>{t('achievement.practitioner')}</label>
            {selectedPractitioner ? (
              <div className="flex items-center" style={{ ...inputStyle, height: 44, display: 'flex', gap: 12, background: 'var(--color-bg-soft)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-text)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 10 }}>{getInitials(selectedPractitioner.first_name, selectedPractitioner.last_name)}</div>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{selectedPractitioner.first_name} {selectedPractitioner.last_name}</span>
                <button onClick={() => { setSelectedPractitioner(null); setSearchText(''); }} className="ml-auto cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12 }}>✕</button>
              </div>
            ) : (
              <>
                <div className="relative"><Search className="absolute top-1/2 -translate-y-1/2" style={{ left: 14, width: 16, height: 16, color: 'var(--color-text-muted)' }} /><input value={searchText} onChange={e => setSearchText(e.target.value)} style={{ ...inputStyle, height: 44, paddingLeft: 40 }} placeholder={t('achievement.searchPlaceholder')} onFocus={focusInput} onBlur={blurInput} /></div>
                {searchResults.length > 0 && (<div className="absolute z-10 mt-1 w-full" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>{searchResults.map(a => (<button key={a.id} onClick={() => { setSelectedPractitioner(a); setSearchText(''); }} className="flex items-center w-full cursor-pointer" style={{ gap: 12, padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', transition: 'var(--transition)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-soft)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--color-text)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 10 }}>{getInitials(a.first_name, a.last_name)}</div><span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)' }}>{a.first_name} {a.last_name}</span></button>))}</div>)}
              </>
            )}
          </div>
          <div><label style={labelStyle}>{t('achievement.belt')}</label><select value={belt} onChange={e => setBelt(e.target.value as Belt)} style={{ ...inputStyle, height: 44 }} onFocus={focusInput as any} onBlur={blurInput as any}><option value="">{t('achievement.selectBelt')}</option><option>Branca</option><option>Cinza</option><option>Amarela</option><option>Laranja</option><option>Verde</option><option>Azul</option><option>Roxa</option><option>Marrom</option><option>Preta</option><option>Preta 1º Grau</option><option>Preta 2º Grau</option><option>Preta 3º Grau</option><option>Preta 4º Grau</option><option>Preta 5º Grau</option><option>Preta 6º Grau</option><option>Preta 7º Grau</option><option>Preta 8º Grau</option><option>Preta 9º Grau</option></select></div>
          <div><label style={labelStyle}>{t('achievement.date')}</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, height: 44 }} onFocus={focusInput} onBlur={blurInput} /></div>
          <div><label style={labelStyle}>{t('achievement.graduatedBy')}</label><input value={graduatedBy} onChange={e => setGraduatedBy(e.target.value)} style={{ ...inputStyle, height: 44 }} onFocus={focusInput} onBlur={blurInput} /></div>
          <div><label style={labelStyle}>{t('achievement.notes')}</label><textarea value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none', padding: '12px 16px' }} placeholder={t('achievement.notesPlaceholder')} onFocus={focusInput as any} onBlur={blurInput as any} /></div>
          <button disabled={!canSubmit} onClick={() => setShowConfirm(true)} style={{ background: canSubmit ? 'var(--color-bg-amber)' : 'var(--color-border)', color: canSubmit ? '#1C1C1C' : 'var(--color-text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 15, padding: '14px 28px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'var(--transition)', width: 'fit-content' }}>{t('achievement.submit')}</button>
        </div>
        <div className="lg:col-span-2">
          <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 12 }}>{t('achievement.preview.label')}</p>
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 24 }}>
            {selectedPractitioner && belt ? (<><div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2D6A4F' }} /><span style={{ fontSize: 11, fontFamily: 'var(--font-sans)', fontWeight: 500, color: '#2D6A4F' }}>{t('achievement.preview.verified')}</span></div><p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14, color: 'var(--color-text)', margin: 0 }}>{selectedPractitioner.first_name} {selectedPractitioner.last_name}</p><p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', margin: '2px 0 12px' }}>{school?.name}</p><div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}><BeltBadge belt={belt as any} size="sm" /><span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)' }}>{date ? formatDate(date) : ''}</span></div><p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>{graduatedBy}</p>{note && <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 8 }}>{note}</p>}</>) : (<p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: '32px 0' }}>{t('achievement.preview.empty')}</p>)}
          </div>
        </div>
      </div>
      {showConfirm && (<div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,25,35,0.5)', padding: 16 }} onClick={() => setShowConfirm(false)}><div onClick={e => e.stopPropagation()} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', padding: 24, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px -15px rgba(0,0,0,0.2)' }}><h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)', marginBottom: 8 }}>{t('achievement.confirm.title')}</h3><p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('achievement.confirm.message', { balance })}</p><div className="flex justify-end" style={{ gap: 12 }}><Button variant="ghost" onClick={() => setShowConfirm(false)}>{t('achievement.confirm.cancel')}</Button><Button onClick={handleConfirm} disabled={loading}>{loading ? t('achievement.confirm.confirming') : t('achievement.confirm.confirm')}</Button></div></div></div>)}
    </div>
  );
}
