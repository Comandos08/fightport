import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shield, Award, QrCode } from 'lucide-react';

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left */}
      <div className="lg:w-1/2 bg-dark p-8 lg:p-16 flex flex-col justify-center text-center lg:text-left">
        <Link to="/" className="flex items-baseline mb-12 justify-center lg:justify-start">
          <span className="font-display font-bold text-2xl" style={{ color: '#fff' }}>fight</span>
          <span className="font-display font-normal text-2xl" style={{ color: '#fff' }}>port</span>
          <span className="font-display font-bold text-2xl text-accent-brand">.pro</span>
        </Link>
        <h1 className="font-display font-extrabold text-4xl lg:text-5xl leading-tight mb-2" style={{ color: '#fff' }}>
          COMECE HOJE,
        </h1>
        <p className="font-body text-lg mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
          seu primeiro cadastro é grátis.
        </p>
        <ul className="space-y-4 mb-10">
          {[
            { icon: Shield, text: 'Certificação digital com hash SHA-256' },
            { icon: QrCode, text: 'QR Code verificável por qualquer pessoa' },
            { icon: Award, text: 'Passaporte digital para cada atleta' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 justify-center lg:justify-start">
              <Icon className="h-5 w-5 text-accent-brand shrink-0" />
              <span className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{text}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl p-5 border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="font-body text-sm italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
            "O fightport.pro trouxe credibilidade e profissionalismo para a nossa academia. Os pais dos alunos adoram."
          </p>
          <p className="font-body text-sm mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            — Prof. Ricardo Almeida, Faixa Preta 5° Grau
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="lg:w-1/2 bg-main p-8 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="font-display font-bold text-2xl text-ink mb-8">Criar conta gratuita</h2>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Nome da escola</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Ex: Academia Tiger BJJ" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Seu nome (Head Coach)</label>
              <input className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Nome completo" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Graduação do Head Coach</label>
              <select className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">Selecione</option>
                <option>Faixa Preta 1° Grau</option>
                <option>Faixa Preta 2° Grau</option>
                <option>Faixa Preta 3° Grau</option>
                <option>Faixa Preta 4° Grau</option>
                <option>Faixa Preta 5° Grau</option>
                <option>Faixa Preta 6° Grau</option>
                <option>Faixa Preta 7° Grau</option>
              </select>
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Arte marcial principal</label>
              <select className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }}>
                <option value="">Selecione</option>
                <option>Jiu-Jitsu</option>
                <option>Judô</option>
                <option>Karatê</option>
                <option>Muay Thai</option>
                <option>Boxe</option>
                <option>Outra</option>
              </select>
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">E-mail</label>
              <input type="email" className="w-full h-12 px-4 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="escola@email.com" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="font-body text-sm text-ink-muted block mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} className="w-full h-12 px-4 pr-12 rounded-lg border bg-popover font-body text-base text-ink placeholder:text-ink-faint focus:outline-none transition-all" style={{ borderColor: 'var(--color-border)' }} placeholder="Mínimo 8 caracteres" onFocus={e => e.currentTarget.style.borderColor = 'var(--color-border-focus)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors cursor-pointer" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg">Criar conta gratuita</Button>
          </form>
          <p className="mt-4 text-center">
            <Link to="/login" className="font-body text-sm text-ink-muted hover:text-ink transition-colors">
              Já tenho conta → Entrar
            </Link>
          </p>
          <p className="mt-4 text-center font-body text-xs text-ink-faint">
            Ao criar conta você concorda com os{' '}
            <Link to="/termos" className="underline">Termos de Uso</Link> e{' '}
            <Link to="/privacidade" className="underline">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
