import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Tab = 'escola' | 'coach' | 'conta';

const inputStyle: React.CSSProperties = { width: '100%', height: 48, padding: '0 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-soft)', fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--color-text)', outline: 'none', transition: 'var(--transition)' };
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 12, color: 'var(--color-text)', display: 'block', marginBottom: 6 };
const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#9A9A9A'; e.currentTarget.style.background = '#FFFFFF'; };
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-soft)'; };

export default function ConfiguracoesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('escola');

  const { data: school } = useQuery({ queryKey: ['school', user?.id], queryFn: async () => { const { data } = await supabase.from('schools').select('*').eq('id', user!.id).single(); return data; }, enabled: !!user });
  const [schoolName, setSchoolName] = useState(''); const [martialArt, setMartialArt] = useState('Jiu-Jitsu'); const [city, setCity] = useState(''); const [state, setState] = useState(''); const [logoUrl, setLogoUrl] = useState<string | null>(null); const [savingSchool, setSavingSchool] = useState(false); const [uploadingLogo, setUploadingLogo] = useState(false); const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (school) { setSchoolName(school.name ?? ''); setMartialArt(school.martial_art ?? 'Jiu-Jitsu'); setCity(school.city ?? ''); setState(school.state ?? ''); setLogoUrl(school.logo_url); } }, [school]);

  const { data: headCoach } = useQuery({ queryKey: ['head-coach', user?.id], queryFn: async () => { const { data } = await supabase.from('head_coaches').select('*').eq('school_id', user!.id).single(); return data; }, enabled: !!user });
  const [coachName, setCoachName] = useState(''); const [coachGraduation, setCoachGraduation] = useState('');
  useEffect(() => { if (headCoach) { setCoachName(headCoach.name ?? ''); setCoachGraduation(headCoach.graduation ?? ''); } }, [headCoach]);
  const [savingCoach, setSavingCoach] = useState(false);

  const [newEmail, setNewEmail] = useState(''); const [showEmailForm, setShowEmailForm] = useState(false); const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [showPasswordForm, setShowPasswordForm] = useState(false); const [savingAccount, setSavingAccount] = useState(false);

  const handleSaveSchool = async (e: React.FormEvent) => { e.preventDefault(); setSavingSchool(true); const { error } = await supabase.from('schools').update({ name: schoolName, martial_art: martialArt, city: city || null, state: state || null }).eq('id', user!.id); setSavingSchool(false); if (error) { toast.error('Erro ao salvar: ' + error.message); return; } queryClient.invalidateQueries({ queryKey: ['school'] }); toast.success('Dados da escola salvos com sucesso'); };
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; } if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 2MB'); return; } setUploadingLogo(true); const ext = file.name.split('.').pop(); const path = `${user!.id}/logo.${ext}`; const { error: uploadError } = await supabase.storage.from('school-logos').upload(path, file, { upsert: true }); if (uploadError) { toast.error('Erro no upload: ' + uploadError.message); setUploadingLogo(false); return; } const { data: publicData } = supabase.storage.from('school-logos').getPublicUrl(path); const url = publicData.publicUrl + '?t=' + Date.now(); await supabase.from('schools').update({ logo_url: url }).eq('id', user!.id); setLogoUrl(url); setUploadingLogo(false); queryClient.invalidateQueries({ queryKey: ['school'] }); toast.success('Logo atualizado com sucesso'); };
  const handleSaveCoach = async (e: React.FormEvent) => { e.preventDefault(); if (!coachName.trim()) { toast.error('Informe o nome do Head Coach'); return; } setSavingCoach(true); if (headCoach) { const { error } = await supabase.from('head_coaches').update({ name: coachName, graduation: coachGraduation }).eq('id', headCoach.id); if (error) { toast.error('Erro ao salvar: ' + error.message); setSavingCoach(false); return; } } else { const { error } = await supabase.from('head_coaches').insert({ school_id: user!.id, name: coachName, graduation: coachGraduation }); if (error) { toast.error('Erro ao salvar: ' + error.message); setSavingCoach(false); return; } } setSavingCoach(false); queryClient.invalidateQueries({ queryKey: ['head-coach'] }); toast.success('Dados do Head Coach salvos'); };
  const handleChangeEmail = async () => { if (!newEmail.trim()) return; setSavingAccount(true); const { error } = await supabase.auth.updateUser({ email: newEmail }); setSavingAccount(false); if (error) { toast.error('Erro: ' + error.message); return; } toast.success('Um e-mail de confirmação foi enviado para o novo endereço'); setShowEmailForm(false); setNewEmail(''); };
  const handleChangePassword = async () => { if (newPassword.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; } if (newPassword !== confirmPassword) { toast.error('As senhas não coincidem'); return; } setSavingAccount(true); const { error } = await supabase.auth.updateUser({ password: newPassword }); setSavingAccount(false); if (error) { toast.error('Erro: ' + error.message); return; } toast.success('Senha alterada com sucesso'); setShowPasswordForm(false); setNewPassword(''); setConfirmPassword(''); };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'escola', label: t('settings.tabs.school') },
    { key: 'coach', label: t('settings.tabs.headCoach') },
    { key: 'conta', label: t('settings.tabs.account') },
  ];

  const saveButtonStyle = (saving: boolean): React.CSSProperties => ({ width: 'fit-content', background: saving ? '#E8E8E5' : '#F5A623', color: saving ? '#9A9A9A' : '#1C1C1C', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, padding: '10px 24px', borderRadius: 6, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'var(--transition)' });

  return (
    <div style={{ padding: '32px 32px', maxWidth: 700 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 28, color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: 32 }}>{t('settings.title')}</h1>
      <div className="flex" style={{ gap: 4, marginBottom: 32, borderBottom: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className="cursor-pointer" style={{ padding: '10px 16px', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: activeTab === tab.key ? 500 : 400, color: activeTab === tab.key ? 'var(--color-text)' : 'var(--color-text-muted)', background: 'none', border: 'none', borderBottom: activeTab === tab.key ? '2px solid var(--color-text)' : '2px solid transparent', marginBottom: -1, transition: 'var(--transition)' }}>{tab.label}</button>))}
      </div>

      {activeTab === 'escola' && (
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSaveSchool}>
          <div><label style={labelStyle}>{t('settings.schoolName')}</label><input value={schoolName} onChange={e => setSchoolName(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
          <div><label style={labelStyle}>{t('settings.martialArt')}</label><select value={martialArt} onChange={e => setMartialArt(e.target.value)} style={inputStyle} onFocus={focusInput as any} onBlur={blurInput as any}><option>Jiu-Jitsu</option><option>Judô</option><option>Karatê</option><option>Muay Thai</option><option>Boxe</option></select></div>
          <div><label style={labelStyle}>{t('settings.logo')}</label><div className="flex items-center" style={{ gap: 16 }}>{logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} /> : <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--color-text-muted)' }}>?</div>}<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /><Button variant="ghost" size="sm" type="button" onClick={() => fileRef.current?.click()} disabled={uploadingLogo}>{uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploadingLogo ? t('settings.uploading') : t('settings.uploadLogo')}</Button></div></div>
          <div className="grid grid-cols-2" style={{ gap: 16 }}><div><label style={labelStyle}>{t('settings.city')}</label><input value={city} onChange={e => setCity(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div><div><label style={labelStyle}>{t('settings.state')}</label><input value={state} onChange={e => setState(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div></div>
          <button type="submit" disabled={savingSchool} style={saveButtonStyle(savingSchool)} onMouseEnter={e => { if (!savingSchool) e.currentTarget.style.background = '#e09600'; }} onMouseLeave={e => { if (!savingSchool) e.currentTarget.style.background = '#F5A623'; }}>{savingSchool ? t('settings.saving') : t('settings.save')}</button>
        </form>
      )}

      {activeTab === 'coach' && (
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSaveCoach}>
          <div><label style={labelStyle}>{t('settings.coachName')}</label><input value={coachName} onChange={e => setCoachName(e.target.value)} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
          <div><label style={labelStyle}>{t('settings.coachGraduation')}</label><input value={coachGraduation} onChange={e => setCoachGraduation(e.target.value)} placeholder={t('settings.coachGraduationPlaceholder')} style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div>
          <button type="submit" disabled={savingCoach} style={saveButtonStyle(savingCoach)} onMouseEnter={e => { if (!savingCoach) e.currentTarget.style.background = '#e09600'; }} onMouseLeave={e => { if (!savingCoach) e.currentTarget.style.background = '#F5A623'; }}>{savingCoach ? t('settings.saving') : t('settings.save')}</button>
        </form>
      )}

      {activeTab === 'conta' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div><label style={labelStyle}>{t('settings.currentEmail')}</label><div className="flex items-center" style={{ gap: 12 }}><input value={user?.email ?? ''} readOnly style={{ ...inputStyle, background: 'var(--color-bg-soft)', color: 'var(--color-text-muted)', cursor: 'not-allowed', flex: 1 }} /><Button variant="ghost" size="sm" type="button" onClick={() => setShowEmailForm(!showEmailForm)}>{t('settings.changeEmail')}</Button></div></div>
          {showEmailForm && (<div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-soft)', display: 'flex', flexDirection: 'column', gap: 12 }}><label style={labelStyle}>{t('settings.newEmail')}</label><input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="novo@email.com" style={inputStyle} onFocus={focusInput} onBlur={blurInput} /><button onClick={handleChangeEmail} disabled={savingAccount} style={saveButtonStyle(savingAccount)} onMouseEnter={e => { if (!savingAccount) e.currentTarget.style.background = '#e09600'; }} onMouseLeave={e => { if (!savingAccount) e.currentTarget.style.background = '#F5A623'; }}>{savingAccount ? t('settings.saving') : t('settings.confirmNewEmail')}</button></div>)}
          <div><Button variant="ghost" type="button" onClick={() => setShowPasswordForm(!showPasswordForm)}>{t('settings.changePassword')}</Button></div>
          {showPasswordForm && (<div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-soft)', display: 'flex', flexDirection: 'column', gap: 12 }}><div><label style={labelStyle}>{t('settings.newPassword')}</label><input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div><div><label style={labelStyle}>{t('settings.confirmPassword')}</label><input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" style={inputStyle} onFocus={focusInput} onBlur={blurInput} /></div><button onClick={handleChangePassword} disabled={savingAccount} style={saveButtonStyle(savingAccount)} onMouseEnter={e => { if (!savingAccount) e.currentTarget.style.background = '#e09600'; }} onMouseLeave={e => { if (!savingAccount) e.currentTarget.style.background = '#F5A623'; }}>{savingAccount ? t('settings.saving') : t('settings.changePassword')}</button></div>)}
        </div>
      )}
    </div>
  );
}
