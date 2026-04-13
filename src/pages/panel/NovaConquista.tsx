import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Copy, Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { CreditBalance } from '@/components/CreditBalance';
import { mockAthletes, mockCredits, type Belt } from '@/lib/mock-data';
import { getInitials, formatDate } from '@/lib/utils';

export default function NovaConquistaPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<typeof mockAthletes[0] | null>(null);
  const [belt, setBelt] = useState<Belt | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [graduatedBy, setGraduatedBy] = useState('Prof. Luiz Felipe Villar');
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const searchResults = searchText.length >= 3
    ? mockAthletes.filter(a => `${a.name} ${a.surname}`.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const generatedHash = 'e7f3a2b1c4d8f9e0a5b6c7d3e1f2a8b9c4d5e6f7a0b1c2d3e4f5a6b7c8d9e0f1';

  if (showSuccess) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-verified flex items-center justify-center">
            <CheckCircle className="h-8 w-8" style={{ color: 'var(--color-verified)' }} />
          </div>
          <h1 className="font-display font-bold text-3xl text-ink mb-2">Conquista registrada!</h1>
          <p className="font-body text-ink-muted mb-8">A graduação foi registrada com sucesso.</p>

          <div className="rounded-xl border p-6 mb-6 text-left bg-main shadow-card max-w-md mx-auto" style={{ borderColor: 'var(--color-border)' }}>
            <label className="font-body text-xs text-ink-faint block mb-1">Hash de verificação</label>
            <div className="flex items-center gap-2 mb-4">
              <code className="font-mono-hash text-xs text-ink break-all flex-1">{generatedHash}</code>
              <button onClick={() => { navigator.clipboard.writeText(generatedHash); toast.success('Hash copiada'); }} className="shrink-0 cursor-pointer" aria-label="Copiar hash">
                <Copy className="h-4 w-4 text-ink-faint hover:text-ink transition-colors" />
              </button>
            </div>

            <label className="font-body text-xs text-ink-faint block mb-2">QR Code</label>
            <div className="w-40 h-40 mx-auto border rounded-lg flex items-center justify-center mb-2" style={{ borderColor: 'var(--color-border)' }}>
              <div className="grid grid-cols-5 gap-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-5 h-5 ${Math.random() > 0.4 ? 'bg-ink' : 'bg-surface'}`} />
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => toast.success('Download iniciado (mock)')}>
              <Download className="h-4 w-4" />
              Download PNG
            </Button>
          </div>

          <p className="font-body text-sm text-ink-muted mb-6">
            Cole a hash e o QR Code no certificado físico da sua academia.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {selectedAthlete && (
              <Link to={`/p/${selectedAthlete.publicId}`}>
                <Button variant="ghost">Ver passaporte do atleta</Button>
              </Link>
            )}
            <Button onClick={() => { setShowSuccess(false); setSelectedAthlete(null); setBelt(''); setSearchText(''); setNote(''); }}>
              Registrar outra conquista
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = selectedAthlete && belt && date && mockCredits.balance > 0;

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <h1 className="font-display font-bold text-3xl text-ink mb-6">Registrar Conquista</h1>

      {/* Credit balance */}
      <div className="mb-6">
        <CreditBalance balance={mockCredits.balance} />
        {mockCredits.balance === 0 && (
          <div className="mt-4 rounded-xl border-2 p-4 text-center" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'rgba(200,241,53,0.08)' }}>
            <p className="font-body text-sm text-ink mb-2">Sem créditos disponíveis.</p>
            <Link to="/painel/creditos"><Button size="sm">Comprar créditos</Button></Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Athlete search */}
          <div className="relative">
            <label className="font-body text-sm text-ink-muted block mb-1.5">Praticante</label>
            {selectedAthlete ? (
              <div className="flex items-center gap-3 h-12 px-4 rounded-lg border bg-surface" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                  {getInitials(selectedAthlete.name, selectedAthlete.surname)}
                </div>
                <span className="font-body text-sm text-ink">{selectedAthlete.name} {selectedAthlete.surname}</span>
                <button onClick={() => { setSelectedAthlete(null); setSearchText(''); }} className="ml-auto text-ink-faint hover:text-ink text-xs cursor-pointer">✕</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
                  <input
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border bg-popover font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none transition-all"
                    style={{ borderColor: 'var(--color-border)' }}
                    placeholder="Buscar por nome (mín. 3 letras)..."
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'}
                    onBlur={e => { setTimeout(() => e.currentTarget && (e.currentTarget.style.borderColor = 'var(--color-border)')); }}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-card" style={{ borderColor: 'var(--color-border)' }}>
                    {searchResults.map(a => (
                      <button
                        key={a.id}
                        onClick={() => { setSelectedAthlete(a); setSearchText(''); }}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface transition-colors cursor-pointer text-left"
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                          {getInitials(a.name, a.surname)}
                        </div>
                        <span className="font-body text-sm text-ink">{a.name} {a.surname}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Belt */}
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Faixa</label>
            <select value={belt} onChange={e => setBelt(e.target.value as Belt)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
              <option value="">Selecione a faixa</option>
              <option>Branca</option>
              <option>Azul</option>
              <option>Roxa</option>
              <option>Marrom</option>
              <option>Preta</option>
              <option>Vermelha</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Data da graduação</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} />
          </div>

          {/* Graduated by */}
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Quem graduou</label>
            <input value={graduatedBy} onChange={e => setGraduatedBy(e.target.value)} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} />
          </div>

          {/* Note */}
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Texto complementar (opcional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border bg-popover font-body text-sm text-ink placeholder:text-ink-faint focus:outline-none transition-all resize-none" style={{ borderColor: 'var(--color-border)' }} placeholder="Ex: Promovido a Faixa Azul pelo cumprimento de todos os requisitos técnicos..." onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
          </div>

          <Button disabled={!canSubmit} className="w-full sm:w-auto" size="lg" onClick={() => setShowConfirm(true)}>
            Registrar conquista
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <p className="font-body text-xs text-ink-faint uppercase tracking-wide mb-3">Preview</p>
          <div className="rounded-xl border p-5 bg-main shadow-card" style={{ borderColor: 'var(--color-border)' }}>
            {selectedAthlete && belt ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-verified" />
                  <span className="text-xs font-body font-medium text-verified">Verificado</span>
                </div>
                <p className="font-display font-bold text-base text-ink">{selectedAthlete.name} {selectedAthlete.surname}</p>
                <p className="font-body text-xs text-ink-muted mb-3">{selectedAthlete.school}</p>
                <div className="flex items-center gap-2 mb-2">
                  <BeltBadge belt={belt as any} size="sm" />
                  <span className="font-body text-xs text-ink-faint">{date ? formatDate(date) : ''}</span>
                </div>
                <p className="font-body text-xs text-ink-muted">{graduatedBy}</p>
                {note && <p className="font-body text-xs text-ink-muted italic mt-2">{note}</p>}
              </>
            ) : (
              <p className="font-body text-sm text-ink-faint text-center py-8">Selecione um atleta e faixa para ver o preview</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-main rounded-xl p-6 shadow-card max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl text-ink mb-2">Confirmar registro</h3>
            <p className="font-body text-sm text-ink-muted mb-4">
              Você está prestes a registrar uma conquista. Isso consumirá 1 crédito do seu saldo ({mockCredits.balance} restantes). Confirmar?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button onClick={() => { setShowConfirm(false); setShowSuccess(true); }}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
