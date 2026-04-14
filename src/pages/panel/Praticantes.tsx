import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Upload, Eye, Award, Pencil, Trash2, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BeltBadge } from '@/components/BeltBadge';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ImportPraticantesModal } from '@/components/ImportPraticantesModal';

const PAGE_SIZE = 20;

export default function PraticantesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [beltFilter, setBeltFilter] = useState('');
  const [artFilter, setArtFilter] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  // Derive unique belt and martial art values for filter options
  const belts = [...new Set(practitioners.map(p => p.current_belt).filter(Boolean))] as string[];
  const arts = [...new Set(practitioners.map(p => p.martial_art).filter(Boolean))] as string[];

  const filtered = practitioners.filter(a => {
    const matchesSearch = `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesBelt = !beltFilter || a.current_belt === beltFilter;
    const matchesArt = !artFilter || a.martial_art === artFilter;
    return matchesSearch && matchesBelt && matchesArt;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const hasActiveFilters = !!beltFilter || !!artFilter;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('practitioners').delete().eq('id', deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (error) {
      toast.error(error.message.includes('foreign') ? 'Não é possível excluir: praticante possui conquistas registradas.' : error.message);
    } else {
      toast.success('Praticante excluído com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['practitioners'] });
      queryClient.invalidateQueries({ queryKey: ['practitioner-count'] });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display font-bold text-2xl text-ink" style={{ letterSpacing: '0.02em' }}>Praticantes</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}>
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
          onChange={e => handleSearchChange(e.target.value)}
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
        <>
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
                {paginatedItems.map((a, i) => (
                  <tr key={a.id} className={i !== paginatedItems.length - 1 ? 'border-b' : ''} style={{ borderColor: 'var(--color-border)' }}>
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
                        <Link to={`/painel/praticantes/${a.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label="Excluir"
                          onClick={() => setDeleteTarget({ id: a.id, name: `${a.first_name} ${a.last_name}` })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="font-body text-sm text-ink-muted">
              {filtered.length} praticante{filtered.length !== 1 ? 's' : ''} · Página {currentPage} de {totalPages}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => p - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`e-${idx}`} className="font-body text-sm text-ink-faint px-1">…</span>
                    ) : (
                      <Button
                        key={item}
                        variant={item === currentPage ? 'default' : 'ghost'}
                        size="icon"
                        className="h-8 w-8 text-sm"
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </Button>
                    )
                  )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-main rounded-xl p-6 shadow-card max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg text-ink mb-2" style={{ letterSpacing: '0.02em' }}>Excluir praticante</h3>
            <p className="font-body text-sm text-ink-muted mb-4">
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ImportPraticantesModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
