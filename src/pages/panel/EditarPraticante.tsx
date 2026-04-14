import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const inputStyle: React.CSSProperties = { width: '100%', height: 48, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)', outline: 'none', transition: 'var(--transition)' };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--color-text)', display: 'block', marginBottom: 6 };
const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#9A9A9A'; e.currentTarget.style.background = '#FFFFFF'; };
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; };

export default function EditarPraticantePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [cpf, setCpf] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [currentBelt, setCurrentBelt] = useState('');

  const beltOptions = ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta', 'Preta 1º Grau', 'Preta 2º Grau', 'Preta 3º Grau', 'Preta 4º Grau', 'Preta 5º Grau', 'Preta 6º Grau', 'Preta 7º Grau', 'Preta 8º Grau', 'Preta 9º Grau'];

  const { data: practitioner, isLoading: fetching } = useQuery({
    queryKey: ['practitioner', id],
    queryFn: async () => { const { data, error } = await supabase.from('practitioners').select('*').eq('id', id!).eq('school_id', user!.id).maybeSingle(); if (error) throw error; return data; },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (practitioner) { setFirstName(practitioner.first_name); setLastName(practitioner.last_name); setBirthDate(practitioner.birth_date ?? ''); setGender(practitioner.gender ?? ''); setCpf(practitioner.cpf ?? ''); setFatherName(practitioner.father_name ?? ''); setMotherName(practitioner.mother_name ?? ''); setCurrentBelt(practitioner.current_belt ?? ''); }
  }, [practitioner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) { toast.error('Nome e sobrenome são obrigatórios.'); return; }
    setLoading(true);
    const { error } = await supabase.from('practitioners').update({ first_name: firstName, last_name: lastName, birth_date: birthDate || null, gender: gender || null, cpf: cpf || null, father_name: fatherName || null, mother_name: motherName || null, current_belt: currentBelt || null }).eq('id', id!).eq('school_id', user!.id);
    setLoading(false);
    if (error) { toast.error('Erro ao atualizar praticante: ' + error.message); } else { toast.success('Praticante atualizado com sucesso!'); queryClient.invalidateQueries({ queryKey: ['practitioners'] }); queryClient.invalidateQueries({ queryKey: ['practitioner', id] }); navigate('/painel/praticantes'); }
  };

  if (fetching) return <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--color-text)', borderTopColor: 'transparent', borderRadius: '50%' }} /></div>;
  if (!practitioner) return <div style={{ padding: '32px 32px', maxWidth: 700 }}><p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)' }}>{t('edit.notFound')}</p><Link to="/painel/praticantes"><Button variant="ghost" style={{ marginTop: 16 }}>{t('edit.back')}</Button></Link></div>;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 24, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 4 }}>{t('edit.title')}</h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 32 }}>ID: {practitioner.fp_id}</p>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 32 }} onSubmit={handleSubmit}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('edit.personalData')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div><label style={labelStyle}>{t('edit.firstName')}</label><input value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle} placeholder={t('edit.firstName')} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('edit.lastName')}</label><input value={lastName} onChange={e => setLastName(e.target.value)} required style={inputStyle} placeholder={t('edit.lastName')} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('edit.dob')}</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('edit.sex')}</label><select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle} onFocus={focusInput as any} onBlur={blurInput as any}><option value="">{t('edit.select')}</option><option value="Masculino">{t('edit.male')}</option><option value="Feminino">{t('edit.female')}</option><option value="Outro">{t('edit.other')}</option></select></div>
            <div className="sm:col-span-2"><label style={labelStyle}>{t('edit.cpf')}</label><input value={cpf} onChange={e => setCpf(e.target.value)} style={inputStyle} placeholder="000.000.000-00" onFocus={focusInput} onBlur={blurInput} /></div>
          </div>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('edit.affiliation')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div><label style={labelStyle}>{t('edit.fatherName')}</label><input value={fatherName} onChange={e => setFatherName(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('edit.motherName')}</label><input value={motherName} onChange={e => setMotherName(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
          </div>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('edit.graduation')}</h2>
          <div><label style={labelStyle}>{t('edit.currentBelt')}</label><select value={currentBelt} onChange={e => setCurrentBelt(e.target.value)} style={inputStyle} onFocus={focusInput as any} onBlur={blurInput as any}><option value="">{t('edit.select')}</option>{beltOptions.map(b => <option key={b}>{b}</option>)}</select></div>
        </section>
        <div className="flex items-center" style={{ gap: 12, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <Link to="/painel/praticantes"><Button variant="ghost" type="button">{t('edit.cancel')}</Button></Link>
          <Button type="submit" disabled={loading}>{loading ? t('edit.saving') : t('edit.save')}</Button>
        </div>
      </form>
    </div>
  );
}
