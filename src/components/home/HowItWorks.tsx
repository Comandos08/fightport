const steps = [
  { num: '01', title: 'A academia cadastra seus atletas', desc: 'Nome, foto e CPF. O sistema bloqueia duplicatas — nenhum atleta pode ter dois perfis.', badge: 'CPF verificado' },
  { num: '02', title: 'Registra a graduação', desc: 'Seleciona o atleta, a nova faixa, a data e quem graduou. Hash gerado automaticamente.', badge: 'SHA-256 · imutável' },
  { num: '03', title: 'Qualquer pessoa verifica', desc: 'Escaneie o QR. Veja o passaporte digital completo do atleta. Assinado. Para sempre.', badge: 'Público · auditável' },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" style={{ background: 'var(--color-bg)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            PROCESSO
          </p>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--color-text)', maxWidth: 480, marginTop: 24, marginBottom: 80 }}>
            Três passos. Para sempre.
          </h2>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} style={{ paddingRight: i < steps.length - 1 ? 40 : 0, borderRight: i < steps.length - 1 ? '1px solid #E8E8E5' : 'none', paddingLeft: i > 0 ? 40 : 0 }}>
                <StepContent step={step} />
              </div>
            ))}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-col">
            {steps.map((step, i) => (
              <div key={step.num} style={{ paddingBottom: i < steps.length - 1 ? 40 : 0, borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none', paddingTop: i > 0 ? 40 : 0 }}>
                <StepContent step={step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepContent({ step }: { step: typeof steps[number] }) {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', marginBottom: 80 }}>{step.num}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 22, color: 'var(--color-text)', letterSpacing: '-0.01em', marginBottom: 16 }}>{step.title}</p>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 400, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)', background: 'var(--color-bg-soft)', padding: '4px 10px', borderRadius: 'var(--radius-xs)', display: 'inline-block', marginTop: 24 }}>{step.badge}</span>
    </>
  );
}
