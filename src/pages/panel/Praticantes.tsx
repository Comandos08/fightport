import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Upload, Eye, Award, Pencil, X, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface EditForm {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  cpf: string;
  father_name: string;
  mother_name: string;
}

interface ImportRow {
  first_name: string;
  last_name: string;
  birth_date?: string;
  gender?: string;
  cpf?: string;
  father_name?: string;
  mother_name?: string;
}

export default function PraticantesPage() {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal state
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Import modal state
  const [importData, setImportData] = useState<ImportRow[] | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importFileName, setImportFileName] = useState('');

  const { data: practitioners = [], isLoading } = useQuery({
    queryKey: ['practitioners', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('practitioners')
        .select('*')
        .eq('school_id', user!.id)
        .order('first_name');
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: school } = useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('name, martial_art').eq('id', user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const filtered = practitioners.filter(a =>
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  // --- Edit handlers ---
  const openEdit = (p: any) => {
    setEditForm({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      birth_date: p.birth_date ?? '',
      gender: p.gender ?? '',
      cpf: p.cpf ?? '',
      father_name: p.father_name ?? '',
      mother_name: p.mother_name ?? '',
    });
  };

  const saveEdit = async () => {
    if (!editForm) return;
    setEditLoading(true);
    const { error } = await supabase.from('practitioners').update({
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      birth_date: editForm.birth_date || null,
      gender: editForm.gender || null,
      cpf: editForm.cpf || null,
      father_name: editForm.father_name || null,
      mother_name: editForm.mother_name || null,
    }).eq('id', editForm.id);
    setEditLoading(false);
    if (error) {
      toast.error('Erro ao salvar: ' + error.message);
    } else {
      toast.success('Praticante atualizado!');
      setEditForm(null);
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    }
  };

  // --- Import handlers ---
  const normalizeHeaders = (raw: string): string => {
    const map: Record<string, string> = {
      nome: 'first_name', 'primeiro nome': 'first_name', 'first name': 'first_name', first_name: 'first_name',
      sobrenome: 'last_name', 'last name': 'last_name', last_name: 'last_name', 'último nome': 'last_name',
      nascimento: 'birth_date', 'data de nascimento': 'birth_date', birth_date: 'birth_date', 'data nascimento': 'birth_date',
      sexo: 'gender', gênero: 'gender', genero: 'gender', gender: 'gender',
      cpf: 'cpf',
      pai: 'father_name', 'nome do pai': 'father_name', father_name: 'father_name',
      mãe: 'mother_name', mae: 'mother_name', 'nome da mãe': 'mother_name', 'nome da mae': 'mother_name', mother_name: 'mother_name',
    };
    return map[raw.toLowerCase().trim()] ?? raw.toLowerCase().trim();
  };

  const parseRows = (rows: Record<string, string>[]): ImportRow[] => {
    return rows
      .map(row => {
        const normalized: Record<string, string> = {};
        Object.entries(row).forEach(([k, v]) => { normalized[normalizeHeaders(k)] = v; });
        if (!normalized.first_name || !normalized.last_name) return null;
        return {
          first_name: normalized.first_name.trim(),
          last_name: normalized.last_name.trim(),
          birth_date: normalized.birth_date?.trim() || undefined,
          gender: normalized.gender?.trim() || undefined,
          cpf: normalized.cpf?.trim() || undefined,
          father_name: normalized.father_name?.trim() || undefined,
          mother_name: normalized.mother_name?.trim() || undefined,
        } as ImportRow;
      })
      .filter(Boolean) as ImportRow[];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = parseRows(results.data as Record<string, string>[]);
          if (rows.length === 0) {
            toast.error('Nenhum praticante válido encontrado. Verifique as colunas "Nome" e "Sobrenome".');
            return;
          }
          setImportData(rows);
        },
        error: () => toast.error('Erro ao ler arquivo CSV.'),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        const rows = parseRows(jsonData);
        if (rows.length === 0) {
          toast.error('Nenhum praticante válido encontrado. Verifique as colunas "Nome" e "Sobrenome".');
          return;
        }
        setImportData(rows);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error('Formato não suportado. Use CSV ou XLSX.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = async () => {
    if (!importData || !user) return;
    setImportLoading(true);

    let successCount = 0;
    let errorCount = 0;

    for (const row of importData) {
      const { data: fpId } = await supabase.rpc('generate_fp_id');
      if (!fpId) { errorCount++; continue; }
      const { error } = await supabase.from('practitioners').insert({
        school_id: user.id,
        fp_id: fpId,
        first_name: row.first_name,
        last_name: row.last_name,
        birth_date: row.birth_date || null,
        gender: row.gender || null,
        cpf: row.cpf || null,
        father_name: row.father_name || null,
        mother_name: row.mother_name || null,
        martial_art: school?.martial_art ?? 'Jiu-Jitsu',
      });
      if (error) errorCount++;
      else successCount++;
    }

    setImportLoading(false);
    setImportData(null);
    queryClient.invalidateQueries({ queryKey: ['practitioners'] });
    queryClient.invalidateQueries({ queryKey: ['practitioner-count'] });

    if (errorCount === 0) {
      toast.success(`${successCount} praticantes importados com sucesso!`);
    } else {
      toast.warning(`${successCount} importados, ${errorCount} com erro.`);
    }
  };

  const inputClass = "w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all";

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-bold text-2xl text-ink" style={{ letterSpacing: '0.02em' }}>Praticantes</h1>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
          <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Importar CSV/XLSX
          </Button>
          <Link to="/painel/praticantes/novo">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Novo praticante
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar praticante..."
          className="w-full h-12 pl-10 pr-4 rounded-lg border bg-popover font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none transition-all"
          style={{ borderColor: 'var(--color-border)' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-accent-brand border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
            <Search className="h-6 w-6 text-ink-faint" />
          </div>
          <p className="font-body font-medium text-ink mb-1">Nenhum praticante cadastrado.</p>
          <p className="font-body text-sm text-ink-muted mb-4">Adicione o primeiro.</p>
          <Link to="/painel/praticantes/novo"><Button>Novo praticante</Button></Link>
        </div>
      ) : (
        <div className="rounded-xl border bg-main shadow-card overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Nome</th>
                <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Arte Marcial</th>
                <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Última Faixa</th>
                <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Escola</th>
                <th className="text-right font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className={i !== filtered.length - 1 ? 'border-b' : ''} style={{ borderColor: 'var(--color-border)' }}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                        {getInitials(a.first_name, a.last_name)}
                      </div>
                      <span className="font-body text-sm font-medium text-ink">{a.first_name} {a.last_name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-body text-sm text-ink-muted">{a.martial_art}</td>
                  <td className="p-4">{a.current_belt ? <BeltBadge belt={a.current_belt as any} size="sm" /> : <span className="font-body text-xs text-ink-faint">—</span>}</td>
                  <td className="p-4 font-body text-sm text-ink-muted">{school?.name ?? '...'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Link to={`/p/${a.fp_id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ver passaporte">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to="/painel/conquistas/nova">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Registrar conquista">
                          <Award className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar" onClick={() => openEdit(a)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setEditForm(null)}>
          <div className="bg-main rounded-xl p-6 shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-lg text-ink" style={{ letterSpacing: '0.02em' }}>Editar Praticante</h3>
              <button onClick={() => setEditForm(null)} className="text-ink-faint hover:text-ink cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-ink-muted block mb-1.5">Nome</label>
                  <input value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div>
                  <label className="font-body text-sm text-ink-muted block mb-1.5">Sobrenome</label>
                  <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-ink-muted block mb-1.5">Data de nascimento</label>
                  <input type="date" value={editForm.birth_date} onChange={e => setEditForm({ ...editForm, birth_date: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div>
                  <label className="font-body text-sm text-ink-muted block mb-1.5">Sexo</label>
                  <select value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }}>
                    <option value="">Selecione</option>
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-body text-sm text-ink-muted block mb-1.5">CPF</label>
                <input value={editForm.cpf} onChange={e => setEditForm({ ...editForm, cpf: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }} placeholder="000.000.000-00" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-ink-muted block mb-1.5">Nome do pai</label>
                  <input value={editForm.father_name} onChange={e => setEditForm({ ...editForm, father_name: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }} />
                </div>
                <div>
                  <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da mãe</label>
                  <input value={editForm.mother_name} onChange={e => setEditForm({ ...editForm, mother_name: e.target.value })} className={inputClass} style={{ borderColor: 'var(--color-border)' }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Button variant="ghost" onClick={() => setEditForm(null)}>Cancelar</Button>
              <Button onClick={saveEdit} disabled={editLoading || !editForm.first_name || !editForm.last_name}>
                {editLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importData && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setImportData(null)}>
          <div className="bg-main rounded-xl p-6 shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-ink-muted" />
                <h3 className="font-display font-bold text-lg text-ink" style={{ letterSpacing: '0.02em' }}>Importar praticantes</h3>
              </div>
              <button onClick={() => setImportData(null)} className="text-ink-faint hover:text-ink cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="rounded-lg border p-3 mb-4 flex items-center gap-2" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(200,241,53,0.08)' }}>
              <CheckCircle className="h-4 w-4 text-accent-brand shrink-0" />
              <p className="font-body text-sm text-ink">
                <strong>{importData.length}</strong> praticantes encontrados em <strong>{importFileName}</strong>
              </p>
            </div>

            <div className="rounded-xl border bg-main shadow-card overflow-x-auto mb-4" style={{ borderColor: 'var(--color-border)' }}>
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-3">#</th>
                    <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-3">Nome</th>
                    <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-3">Nascimento</th>
                    <th className="text-left font-body text-xs font-medium text-ink-faint uppercase tracking-wide p-3">Sexo</th>
                  </tr>
                </thead>
                <tbody>
                  {importData.slice(0, 20).map((row, i) => (
                    <tr key={i} className={i !== Math.min(importData.length, 20) - 1 ? 'border-b' : ''} style={{ borderColor: 'var(--color-border)' }}>
                      <td className="p-3 font-body text-xs text-ink-faint">{i + 1}</td>
                      <td className="p-3 font-body text-sm text-ink">{row.first_name} {row.last_name}</td>
                      <td className="p-3 font-body text-sm text-ink-muted">{row.birth_date ?? '—'}</td>
                      <td className="p-3 font-body text-sm text-ink-muted">{row.gender ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importData.length > 20 && (
              <p className="font-body text-xs text-ink-faint mb-4 text-center">
                Mostrando 20 de {importData.length} praticantes
              </p>
            )}

            <div className="flex items-center gap-2 rounded-lg border p-3 mb-4" style={{ borderColor: 'var(--color-border)' }}>
              <AlertCircle className="h-4 w-4 text-ink-faint shrink-0" />
              <p className="font-body text-xs text-ink-muted">
                Colunas reconhecidas: Nome, Sobrenome, Data Nascimento, Sexo, CPF, Nome do Pai, Nome da Mãe (PT-BR ou EN)
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setImportData(null)}>Cancelar</Button>
              <Button onClick={confirmImport} disabled={importLoading}>
                {importLoading ? 'Importando...' : `Importar ${importData.length} praticantes`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
