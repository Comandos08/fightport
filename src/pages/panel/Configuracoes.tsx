import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

type Tab = 'escola' | 'coach' | 'conta';

const inputClass = "w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all";

function useInputStyle() {
  return {
    style: { borderColor: 'var(--color-border)' } as React.CSSProperties,
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.currentTarget.style.borderColor = 'var(--color-border-focus)',
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.currentTarget.style.borderColor = 'var(--color-border)',
  };
}

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('escola');
  const inputProps = useInputStyle();

  // ── School state ──
  const { data: school } = useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('*').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const [schoolName, setSchoolName] = useState('');
  const [martialArt, setMartialArt] = useState('Jiu-Jitsu');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [savingSchool, setSavingSchool] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (school) {
      setSchoolName(school.name ?? '');
      setMartialArt(school.martial_art ?? 'Jiu-Jitsu');
      setCity(school.city ?? '');
      setState(school.state ?? '');
      setLogoUrl(school.logo_url);
    }
  }, [school]);

  // ── Head Coach state ──
  const { data: headCoach } = useQuery({
    queryKey: ['head-coach', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('head_coaches').select('*').eq('school_id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const [coachName, setCoachName] = useState('');
  const [coachGraduation, setCoachGraduation] = useState('');

  useEffect(() => {
    if (headCoach) {
      setCoachName(headCoach.name ?? '');
      setCoachGraduation(headCoach.graduation ?? '');
    }
  }, [headCoach]);

  const [savingCoach, setSavingCoach] = useState(false);

  // ── Account state ──
  const [newEmail, setNewEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);

  // ── Handlers ──
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchool(true);
    const { error } = await supabase.from('schools').update({
      name: schoolName,
      martial_art: martialArt,
      city: city || null,
      state: state || null,
    }).eq('id', user!.id);
    setSavingSchool(false);
    if (error) { toast.error('Erro ao salvar: ' + error.message); return; }
    queryClient.invalidateQueries({ queryKey: ['school'] });
    toast.success('Dados da escola salvos com sucesso');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione um arquivo de imagem'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 2MB'); return; }

    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const path = `${user!.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage.from('school-logos').upload(path, file, { upsert: true });
    if (uploadError) { toast.error('Erro no upload: ' + uploadError.message); setUploadingLogo(false); return; }

    const { data: publicData } = supabase.storage.from('school-logos').getPublicUrl(path);
    const url = publicData.publicUrl + '?t=' + Date.now();

    await supabase.from('schools').update({ logo_url: url }).eq('id', user!.id);
    setLogoUrl(url);
    setUploadingLogo(false);
    queryClient.invalidateQueries({ queryKey: ['school'] });
    toast.success('Logo atualizado com sucesso');
  };

  const handleSaveCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName.trim()) { toast.error('Informe o nome do Head Coach'); return; }
    setSavingCoach(true);

    if (headCoach) {
      const { error } = await supabase.from('head_coaches').update({ name: coachName, graduation: coachGraduation }).eq('id', headCoach.id);
      if (error) { toast.error('Erro ao salvar: ' + error.message); setSavingCoach(false); return; }
    } else {
      const { error } = await supabase.from('head_coaches').insert({ school_id: user!.id, name: coachName, graduation: coachGraduation });
      if (error) { toast.error('Erro ao salvar: ' + error.message); setSavingCoach(false); return; }
    }

    setSavingCoach(false);
    queryClient.invalidateQueries({ queryKey: ['head-coach'] });
    toast.success('Dados do Head Coach salvos');
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingAccount(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingAccount(false);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Um e-mail de confirmação foi enviado para o novo endereço');
    setShowEmailForm(false);
    setNewEmail('');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
    if (newPassword !== confirmPassword) { toast.error('As senhas não coincidem'); return; }
    setSavingAccount(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingAccount(false);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Senha alterada com sucesso');
    setShowPasswordForm(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'escola', label: 'Escola' },
    { key: 'coach', label: 'Head Coach' },
    { key: 'conta', label: 'Conta' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-6" style={{ letterSpacing: '0.02em' }}>Configurações</h1>

      <div className="flex gap-1 mb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 font-body text-sm transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === t.key ? 'text-ink font-medium' : 'text-ink-muted hover:text-ink border-transparent'
            }`}
            style={activeTab === t.key ? { borderColor: 'var(--color-accent)' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'escola' && (
        <form className="space-y-4" onSubmit={handleSaveSchool}>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da escola</label>
            <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className={inputClass} {...inputProps} />
          </div>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Arte marcial principal</label>
            <select value={martialArt} onChange={e => setMartialArt(e.target.value)} className={inputClass} {...inputProps}>
              <option>Jiu-Jitsu</option>
              <option>Judô</option>
              <option>Karatê</option>
              <option>Muay Thai</option>
              <option>Boxe</option>
            </select>
          </div>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Logo (opcional)</label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo da escola" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center font-display font-bold text-ink-faint">?</div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button variant="ghost" size="sm" type="button" onClick={() => fileRef.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploadingLogo ? 'Enviando...' : 'Enviar logo'}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Cidade</label>
              <input value={city} onChange={e => setCity(e.target.value)} className={inputClass} {...inputProps} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Estado</label>
              <input value={state} onChange={e => setState(e.target.value)} className={inputClass} {...inputProps} />
            </div>
          </div>
          <Button disabled={savingSchool}>
            {savingSchool ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      )}

      {activeTab === 'coach' && (
        <form className="space-y-4" onSubmit={handleSaveCoach}>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Nome do Head Coach</label>
            <input value={coachName} onChange={e => setCoachName(e.target.value)} className={inputClass} {...inputProps} />
          </div>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Graduação</label>
            <input value={coachGraduation} onChange={e => setCoachGraduation(e.target.value)} placeholder="Ex: Faixa Preta 3° Grau" className={inputClass} {...inputProps} />
          </div>
          <Button disabled={savingCoach}>
            {savingCoach ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </form>
      )}

      {activeTab === 'conta' && (
        <div className="space-y-6">
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">E-mail atual</label>
            <div className="flex items-center gap-3">
              <input value={user?.email ?? ''} readOnly className="flex-1 h-12 px-4 rounded-lg border bg-surface font-body text-base text-ink-muted cursor-not-allowed" style={{ borderColor: 'var(--color-border)' }} />
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowEmailForm(!showEmailForm)}>
                Alterar e-mail
              </Button>
            </div>
          </div>

          {showEmailForm && (
            <div className="space-y-3 p-4 rounded-lg bg-surface">
              <label className="font-body text-sm text-ink-muted block mb-1.5">Novo e-mail</label>
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email" placeholder="novo@email.com" className={inputClass} {...inputProps} />
              <Button onClick={handleChangeEmail} disabled={savingAccount} size="sm">
                {savingAccount ? 'Salvando...' : 'Confirmar novo e-mail'}
              </Button>
            </div>
          )}

          <div>
            <Button variant="ghost" type="button" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              Alterar senha
            </Button>
          </div>

          {showPasswordForm && (
            <div className="space-y-3 p-4 rounded-lg bg-surface">
              <div>
                <label className="font-body text-sm text-ink-muted block mb-1.5">Nova senha</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" className={inputClass} {...inputProps} />
              </div>
              <div>
                <label className="font-body text-sm text-ink-muted block mb-1.5">Confirmar nova senha</label>
                <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" className={inputClass} {...inputProps} />
              </div>
              <Button onClick={handleChangePassword} disabled={savingAccount} size="sm">
                {savingAccount ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
