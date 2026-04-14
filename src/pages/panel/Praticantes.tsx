import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Upload, Eye, Award, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { mockAthletes } from '@/lib/mock-data';
import { getInitials } from '@/lib/utils';

export default function PraticantesPage() {
  const [search, setSearch] = useState('');

  const filtered = mockAthletes.filter(a =>
    `${a.name} ${a.surname}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-bold text-2xl text-ink" style={{ letterSpacing: '0.02em' }}>Praticantes</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
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

      {/* Search */}
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

      {filtered.length === 0 ? (
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
              {filtered.map((a, i) => {
                const lastBelt = a.achievements[a.achievements.length - 1];
                return (
                  <tr key={a.id} className={i !== filtered.length - 1 ? 'border-b' : ''} style={{ borderColor: 'var(--color-border)' }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0" style={{ backgroundColor: '#C9A84C', color: '#fff' }}>
                          {getInitials(a.name, a.surname)}
                        </div>
                        <span className="font-body text-sm font-medium text-ink">{a.name} {a.surname}</span>
                      </div>
                    </td>
                    <td className="p-4 font-body text-sm text-ink-muted">{a.sport}</td>
                    <td className="p-4"><BeltBadge belt={lastBelt.belt} size="sm" /></td>
                    <td className="p-4 font-body text-sm text-ink-muted">{a.school}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/p/${a.publicId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ver passaporte">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link to="/painel/conquistas/nova">
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Registrar conquista">
                            <Award className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
