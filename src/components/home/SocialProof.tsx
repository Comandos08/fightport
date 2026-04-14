import { mockStats } from '@/lib/mock-data';

export function SocialProof() {
  return (
    <section className="py-24 lg:py-28 px-4">
      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-5">
          <h2
            className="font-display font-extrabold text-[48px] md:text-[64px] text-ink uppercase"
            style={{ lineHeight: '0.9' }}
          >
            MAIS DE {mockStats.totalAthletes.toLocaleString('pt-BR')} ATLETAS CERTIFICADOS.
          </h2>
        </div>

        <div className="lg:col-span-7">
          <div className="flex gap-12 md:gap-16 mb-12">
            {[
              { value: mockStats.totalAthletes.toLocaleString('pt-BR'), label: 'Atletas' },
              { value: mockStats.totalSchools.toString(), label: 'Academias' },
              { value: mockStats.totalCertificates.toLocaleString('pt-BR'), label: 'Certificados' },
            ].map(m => (
              <div key={m.label}>
                <span className="font-display font-bold text-[28px] md:text-[36px] text-ink block" style={{ lineHeight: '1' }}>
                  {m.value}
                </span>
                <span className="font-body text-sm text-ink-faint">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="relative">
            <span
              className="font-display font-bold text-[80px] md:text-[100px] absolute -top-12 -left-4 select-none pointer-events-none"
              style={{ color: 'var(--color-bg-surface)', lineHeight: '1' }}
            >
              &ldquo;
            </span>
            <blockquote className="font-body italic text-base md:text-lg text-ink-muted pl-8" style={{ lineHeight: '1.65' }}>
              Agora qualquer árbitro ou federação consegue confirmar a faixa dos meus alunos na hora. Isso mudou a credibilidade da minha academia.
            </blockquote>
            <p className="font-body text-sm text-ink-faint mt-4 pl-8">
              — Prof. Luiz Felipe Villar, Faixa Preta 6° Grau
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
