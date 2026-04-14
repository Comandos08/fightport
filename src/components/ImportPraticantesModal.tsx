import { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, X, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ParsedRow {
  first_name: string;
  last_name: string;
  birth_date?: string;
  gender?: string;
  cpf?: string;
  father_name?: string;
  mother_name?: string;
}

interface RowResult extends ParsedRow {
  row: number;
  status: 'valid' | 'error' | 'imported';
  error?: string;
}

const COLUMN_MAP: Record<string, keyof ParsedRow> = {
  nome: 'first_name',
  first_name: 'first_name',
  primeiro_nome: 'first_name',
  sobrenome: 'last_name',
  last_name: 'last_name',
  data_nascimento: 'birth_date',
  birth_date: 'birth_date',
  nascimento: 'birth_date',
  sexo: 'gender',
  gender: 'gender',
  genero: 'gender',
  cpf: 'cpf',
  nome_pai: 'father_name',
  father_name: 'father_name',
  pai: 'father_name',
  nome_mae: 'mother_name',
  mother_name: 'mother_name',
  mae: 'mother_name',
};

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
}

function parseDate(val: string | undefined): string | null {
  if (!val) return null;
  const s = val.trim();
  const brMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

function mapRow(raw: Record<string, string>, rowNum: number): RowResult {
  const mapped: Partial<ParsedRow> = {};
  for (const [key, val] of Object.entries(raw)) {
    const norm = normalizeKey(key);
    const field = COLUMN_MAP[norm];
    if (field) mapped[field] = val?.toString().trim() ?? '';
  }

  if (!mapped.first_name) return { row: rowNum, first_name: '', last_name: '', status: 'error', error: 'Coluna "nome" / "first_name" não encontrada ou vazia' };
  if (!mapped.last_name) return { row: rowNum, first_name: mapped.first_name, last_name: '', status: 'error', error: 'Coluna "sobrenome" / "last_name" não encontrada ou vazia' };

  return {
    row: rowNum,
    first_name: mapped.first_name,
    last_name: mapped.last_name,
    birth_date: parseDate(mapped.birth_date as string) ?? undefined,
    gender: mapped.gender || undefined,
    cpf: mapped.cpf || undefined,
    father_name: mapped.father_name || undefined,
    mother_name: mapped.mother_name || undefined,
    status: 'valid',
  };
}

export function ImportPraticantesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<RowResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState('');

  if (!open) return null;

  const validRows = rows.filter(r => r.status === 'valid');
  const errorRows = rows.filter(r => r.status === 'error');
  const importedRows = rows.filter(r => r.status === 'imported');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(false);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || ext === 'txt') {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (result) => {
          setRows(result.data.map((r, i) => mapRow(r, i + 2)));
        },
        error: () => toast.error('Erro ao ler o arquivo CSV'),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
        setRows(data.map((r, i) => mapRow(r, i + 2)));
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Formato não suportado. Use CSV ou XLSX.');
    }

    if (fileRef.current) fileRef.current.value = '';
  };

  const handleImport = async () => {
    if (!user || validRows.length === 0) return;
    setImporting(true);

    const { data: school } = await supabase.from('schools').select('martial_art').eq('id', user.id).single();
    const martialArt = school?.martial_art ?? 'Jiu-Jitsu';

    const updated = [...rows];
    let successCount = 0;

    for (let i = 0; i < updated.length; i++) {
      const r = updated[i];
      if (r.status !== 'valid') continue;

      const { data: fpId, error: fpError } = await supabase.rpc('generate_fp_id');
      if (fpError || !fpId) {
        updated[i] = { ...r, status: 'error', error: 'Erro ao gerar ID' };
        continue;
      }

      const { error } = await supabase.from('practitioners').insert({
        school_id: user.id,
        fp_id: fpId,
        first_name: r.first_name,
        last_name: r.last_name,
        birth_date: r.birth_date || null,
        gender: r.gender || null,
        cpf: r.cpf || null,
        father_name: r.father_name || null,
        mother_name: r.mother_name || null,
        martial_art: martialArt,
      });

      if (error) {
        updated[i] = { ...r, status: 'error', error: error.message.includes('duplicate') ? 'CPF duplicado' : error.message };
      } else {
        updated[i] = { ...r, status: 'imported' };
        successCount++;
      }
    }

    setRows(updated);
    setImporting(false);
    setDone(true);

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      queryClient.invalidateQueries({ queryKey: ['practitioner-count'] });
      toast.success(`${successCount} praticante(s) importado(s) com sucesso!`);
    }
  };

  const handleDownloadTemplate = () => {
    const csv = 'nome,sobrenome,data_nascimento,sexo,cpf,nome_pai,nome_mae\nJoão,Silva,15/03/1995,Masculino,123.456.789-00,Carlos Silva,Maria Silva\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_praticantes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setRows([]);
    setDone(false);
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', padding: 16 }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-sm)',
          maxWidth: 640,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px -15px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: 24, borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 18, color: 'var(--color-text)' }}>Importar Praticantes</h2>
          <button onClick={onClose} className="cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}><X className="h-5 w-5" /></button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <FileSpreadsheet style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'var(--color-text-muted)' }} />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text)', marginBottom: 4 }}>Envie um arquivo CSV ou XLSX com os dados dos praticantes.</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24 }}>
                Colunas aceitas: nome, sobrenome, data_nascimento, sexo, cpf, nome_pai, nome_mae
              </p>
              <div className="flex flex-col sm:flex-row justify-center" style={{ gap: 12 }}>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.txt" className="hidden" onChange={handleFile} />
                <Button onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Selecionar arquivo
                </Button>
                <Button variant="ghost" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4" />
                  Baixar modelo CSV
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center flex-wrap" style={{ gap: 16, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>
                  📄 {fileName} — {rows.length} linha(s)
                </span>
                {validRows.length > 0 && (
                  <span className="flex items-center" style={{ gap: 4, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: '#2D6A4F' }}>
                    <CheckCircle style={{ width: 14, height: 14 }} /> {done ? importedRows.length + ' importado(s)' : validRows.length + ' válido(s)'}
                  </span>
                )}
                {errorRows.length > 0 && (
                  <span className="flex items-center" style={{ gap: 4, fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 500, color: '#DC2626' }}>
                    <AlertCircle style={{ width: 14, height: 14 }} /> {errorRows.length} erro(s)
                  </span>
                )}
              </div>

              {/* Table preview */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'auto', maxHeight: '40vh' }}>
                <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--color-bg-soft)', position: 'sticky', top: 0 }}>
                      {['#', 'Nome', 'Sobrenome', 'Nascimento', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: 8, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: 8, fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>{r.row}</td>
                        <td style={{ padding: 8, fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>{r.first_name || '—'}</td>
                        <td style={{ padding: 8, fontFamily: 'var(--font-sans)', color: 'var(--color-text)' }}>{r.last_name || '—'}</td>
                        <td style={{ padding: 8, fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>{r.birth_date || '—'}</td>
                        <td style={{ padding: 8 }}>
                          {r.status === 'valid' && <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>Pronto</span>}
                          {r.status === 'imported' && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, color: '#2D6A4F' }}>✓ Importado</span>}
                          {r.status === 'error' && <span style={{ fontFamily: 'var(--font-sans)', color: '#DC2626' }} title={r.error}>✕ {r.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <div className="flex items-center justify-between" style={{ padding: 24, borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={handleReset} disabled={importing}>
              {done ? 'Importar outro' : 'Trocar arquivo'}
            </Button>
            {!done && (
              <Button onClick={handleImport} disabled={importing || validRows.length === 0}>
                {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {importing ? `Importando...` : `Importar ${validRows.length} praticante(s)`}
              </Button>
            )}
            {done && (
              <Button onClick={onClose}>Fechar</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
