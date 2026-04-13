import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { mockCurrentSchool } from '@/lib/mock-data';

type Tab = 'escola' | 'coach' | 'conta';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('escola');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'escola', label: 'Escola' },
    { key: 'coach', label: 'Head Coach' },
    { key: 'conta', label: 'Conta' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <h1 className="font-display font-bold text-3xl text-ink mb-6">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 font-body text-sm transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === t.key
                ? 'text-ink font-medium'
                : 'text-ink-muted hover:text-ink border-transparent'
            }`}
            style={activeTab === t.key ? { borderColor: 'var(--color-accent)' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'escola' && (
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da escola</label>
            <input defaultValue={mockCurrentSchool.name} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
          </div>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Arte marcial principal</label>
            <select defaultValue={mockCurrentSchool.sport[0]} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
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
              <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center font-display font-bold text-ink-faint">?</div>
              <Button variant="ghost" size="sm" type="button">Enviar logo</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Cidade</label>
              <input defaultValue={mockCurrentSchool.city} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Estado</label>
              <input defaultValue={mockCurrentSchool.state} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
          </div>
          <Button>Salvar alterações</Button>
        </form>
      )}

      {activeTab === 'coach' && (
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Nome do Head Coach</label>
            <input defaultValue={mockCurrentSchool.headCoach} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
          </div>
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">Graduação</label>
            <input defaultValue={mockCurrentSchool.headCoachBelt} className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
          </div>
          <Button>Salvar alterações</Button>
        </form>
      )}

      {activeTab === 'conta' && (
        <div className="space-y-6">
          <div>
            <label className="font-body text-sm text-ink-muted block mb-1.5">E-mail</label>
            <div className="flex items-center gap-3">
              <input value="escola@tigerbjj.com" readOnly className="flex-1 h-12 px-4 rounded-lg border bg-surface font-body text-base text-ink-muted cursor-not-allowed" style={{ borderColor: 'var(--color-border)' }} />
              <Button variant="ghost" size="sm">Alterar e-mail</Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-start">
            <Button variant="ghost">Alterar senha</Button>
            <Button variant="ghost" className="text-destructive hover:text-destructive">Excluir conta</Button>
          </div>
        </div>
      )}
    </div>
  );
}
