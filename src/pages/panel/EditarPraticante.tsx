import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const inputClass = "w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all";
const borderStyle = { borderColor: 'var(--color-border)' } as React.CSSProperties;

export default function EditarPraticantePage() {
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

  const { data: practitioner, isLoading: fetching } = useQuery({
    queryKey: ['practitioner', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('id', id!)
        .eq('school_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  useEffect(() => {
    if (practitioner) {
      setFirstName(practitioner.first_name);
      setLastName(practitioner.last_name);
      setBirthDate(practitioner.birth_date ?? '');
      setGender(practitioner.gender ?? '');
      setCpf(practitioner.cpf ?? '');
      setFatherName(practitioner.father_name ?? '');
      setMotherName(practitioner.mother_name ?? '');
    }
  }, [practitioner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      toast.error('Nome e sobrenome são obrigatórios.');
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('practitioners')
      .update({
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        gender: gender || null,
        cpf: cpf || null,
        father_name: fatherName || null,
        mother_name: motherName || null,
      })
      .eq('id', id!)
      .eq('school_id', user!.id);

    setLoading(false);
    if (error) {
      toast.error('Erro ao atualizar praticante: ' + error.message);
    } else {
      toast.success('Praticante atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      queryClient.invalidateQueries({ queryKey: ['practitioner', id] });
      navigate('/painel/praticantes');
    }
  };

  if (fetching) {
    return (
      <div className="p-4 lg:p-8 flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-ink-faint" />
      </div>
    );
  }

  if (!practitioner) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl">
        <p className="font-body text-ink-muted">Praticante não encontrado.</p>
        <Link to="/painel/praticantes"><Button variant="ghost" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.currentTarget.style.borderColor = 'var(--color-border-focus)';
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => e.currentTarget.style.borderColor = 'var(--color-border)';

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-2" style={{ letterSpacing: '0.02em' }}>Editar Praticante</h1>
      <p className="font-body text-sm text-ink-muted mb-8">ID: {practitioner.fp_id}</p>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Dados Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClass} style={borderStyle} placeholder="Nome" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Sobrenome</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClass} style={borderStyle} placeholder="Sobrenome" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Data de nascimento</label>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} style={borderStyle} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Sexo</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass} style={borderStyle}>
                <option value="">Selecione</option>
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-body text-sm text-ink-muted block mb-1.5">CPF</label>
              <input value={cpf} onChange={e => setCpf(e.target.value)} className={inputClass} style={borderStyle} placeholder="000.000.000-00" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Filiação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome do pai</label>
              <input value={fatherName} onChange={e => setFatherName(e.target.value)} className={inputClass} style={borderStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da mãe</label>
              <input value={motherName} onChange={e => setMotherName(e.target.value)} className={inputClass} style={borderStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Link to="/painel/praticantes">
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
