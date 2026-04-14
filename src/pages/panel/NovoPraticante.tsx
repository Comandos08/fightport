import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NovoPraticantePage() {
  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-ink mb-8" style={{ letterSpacing: '0.02em' }}>Novo Praticante</h1>

      <form className="space-y-8" onSubmit={e => e.preventDefault()}>
        {/* Dados pessoais */}
        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Dados Pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Nome" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Sobrenome</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Sobrenome" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Data de nascimento</label>
              <input type="date" className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Sexo</label>
              <select className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">Selecione</option>
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-body text-sm text-ink-muted block mb-1.5">CPF</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="000.000.000-00" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
              <p className="font-body text-xs text-ink-faint mt-1">Usado apenas para evitar duplicatas — nunca exibido publicamente</p>
            </div>
            <div className="sm:col-span-2">
              <label className="font-body text-sm text-ink-muted block mb-1.5">Foto (opcional)</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center font-display font-bold text-lg text-ink-faint">?</div>
                <Button variant="ghost" size="sm" type="button">Enviar foto</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filiação */}
        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Filiação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome do pai</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da mãe</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
          </div>
        </section>

        {/* Arte marcial */}
        <section>
          <h2 className="font-display font-bold text-base text-ink mb-4 uppercase tracking-wide">Arte Marcial</h2>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Arte marcial da escola</label>
            <input className="w-full h-12 px-4 rounded-lg border bg-surface font-body text-base text-ink-muted cursor-not-allowed" style={{ borderColor: 'var(--color-border)' }} value="Jiu-Jitsu" readOnly />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Link to="/painel/praticantes">
            <Button variant="ghost">Cancelar</Button>
          </Link>
          <Button type="submit">Salvar praticante</Button>
        </div>
      </form>
    </div>
  );
}
