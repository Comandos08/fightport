import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function NovoPraticantePage() {
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

  const { data: school } = useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('martial_art').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast.error('Nome e sobrenome são obrigatórios.');
      return;
    }

    setLoading(true);

    // Generate FP-ID via database function
    const { data: fpId, error: fpError } = await supabase.rpc('generate_fp_id');
    if (fpError || !fpId) {
      toast.error('Erro ao gerar ID do praticante.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('practitioners').insert({
      school_id: user!.id,
      fp_id: fpId,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate || null,
      gender: gender || null,
      cpf: cpf || null,
      father_name: fatherName || null,
      mother_name: motherName || null,
      martial_art: school?.martial_art ?? 'Jiu-Jitsu',
    });

    setLoading(false);
    if (error) {
      toast.error('Erro ao cadastrar praticante: ' + error.message);
    } else {
      toast.success('Praticante cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      queryClient.invalidateQueries({ queryKey: ['practitioner-count'] });
      navigate('/painel/praticantes');
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-8" style={{ letterSpacing: '0.02em' }}>Novo Praticante</h1>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Dados Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Nome" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Sobrenome</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Sobrenome" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Data de nascimento</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Sexo</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">Selecione</option>
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-body text-sm text-ink-muted block mb-1.5">CPF</label>
              <input value={cpf} onChange={e => setCpf(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="000.000.000-00" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
              <p className="font-body text-xs text-ink-faint mt-1">Usado apenas para evitar duplicatas — nunca exibido publicamente</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Filiação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome do pai</label>
              <input value={fatherName} onChange={e => setFatherName(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da mãe</label>
              <input value={motherName} onChange={e => setMotherName(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Arte Marcial</h2>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Arte marcial da escola</label>
            <input className="w-full h-12 px-4 rounded-lg border bg-surface font-body text-base text-ink-muted cursor-not-allowed" style={{ borderColor: 'var(--color-border)' }} value={school?.martial_art ?? 'Jiu-Jitsu'} readOnly />
          </div>
        </section>

        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Link to="/painel/praticantes">
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar praticante'}
          </Button>
        </div>
      </form>
    </div>
  );
}
