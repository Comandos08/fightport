import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function NovoPraticantePage() {
  const { t } = useTranslation();
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

  const { data: school } = useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => { const { data } = await supabase.from('schools').select('martial_art').eq('id', user!.id).single(); return data; },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) { toast.error('Nome e sobrenome são obrigatórios.'); return; }
    setLoading(true);
    const { data: fpId, error: fpError } = await supabase.rpc('generate_fp_id');
    if (fpError || !fpId) { toast.error('Erro ao gerar ID do praticante.'); setLoading(false); return; }
    const { error } = await supabase.from('practitioners').insert({ school_id: user!.id, fp_id: fpId, first_name: firstName, last_name: lastName, birth_date: birthDate || null, gender: gender || null, cpf: cpf || null, father_name: fatherName || null, mother_name: motherName || null, martial_art: school?.martial_art ?? 'Jiu-Jitsu', current_belt: currentBelt || null });
    setLoading(false);
    if (error) { toast.error('Erro ao cadastrar praticante: ' + error.message); } else { toast.success('Praticante cadastrado com sucesso!'); queryClient.invalidateQueries({ queryKey: ['practitioners'] }); queryClient.invalidateQueries({ queryKey: ['practitioner-count'] }); navigate('/painel/praticantes'); }
  };

  return (
    <div style={{ padding: '32px 32px', maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 24, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 32 }}>{t('newPractitioner.title')}</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: 32 }} onSubmit={handleSubmit}>
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('newPractitioner.personalData')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div><label style={labelStyle}>{t('newPractitioner.firstName')}</label><input value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle} placeholder={t('newPractitioner.firstName')} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('newPractitioner.lastName')}</label><input value={lastName} onChange={e => setLastName(e.target.value)} required style={inputStyle} placeholder={t('newPractitioner.lastName')} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('newPractitioner.dob')}</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('newPractitioner.sex')}</label><select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle} onFocus={focusInput as any} onBlur={blurInput as any}><option value="">{t('newPractitioner.select')}</option><option value="Masculino">{t('newPractitioner.male')}</option><option value="Feminino">{t('newPractitioner.female')}</option><option value="Outro">{t('newPractitioner.other')}</option></select></div>
            <div className="sm:col-span-2"><label style={labelStyle}>{t('newPractitioner.cpf')}</label><input value={cpf} onChange={e => setCpf(e.target.value)} style={inputStyle} placeholder="000.000.000-00" onFocus={focusInput} onBlur={blurInput} /><p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{t('newPractitioner.cpfHint')}</p></div>
          </div>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('newPractitioner.affiliation')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div><label style={labelStyle}>{t('newPractitioner.fatherName')}</label><input value={fatherName} onChange={e => setFatherName(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
            <div><label style={labelStyle}>{t('newPractitioner.motherName')}</label><input value={motherName} onChange={e => setMotherName(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
          </div>
        </section>
        <section>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 16 }}>{t('newPractitioner.martialArtSection')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
            <div><label style={labelStyle}>{t('newPractitioner.schoolArt')}</label><input style={{ ...inputStyle, color: 'var(--color-text-muted)', cursor: 'not-allowed' }} value={school?.martial_art ?? 'Jiu-Jitsu'} readOnly /></div>
            <div><label style={labelStyle}>{t('newPractitioner.currentBelt')}</label><select value={currentBelt} onChange={e => setCurrentBelt(e.target.value)} style={inputStyle} onFocus={focusInput as any} onBlur={blurInput as any}><option value="">{t('newPractitioner.select')}</option>{beltOptions.map(b => <option key={b}>{b}</option>)}</select></div>
          </div>
        </section>
        <div className="flex items-center" style={{ gap: 12, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <Link to="/painel/praticantes"><Button variant="ghost" type="button">{t('newPractitioner.cancel')}</Button></Link>
          <Button type="submit" disabled={loading}>{loading ? t('newPractitioner.saving') : t('newPractitioner.save')}</Button>
        </div>
      </form>
    </div>
  );
}
