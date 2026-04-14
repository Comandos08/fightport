const steps = [
  {
    num: '01',
    title: 'A academia cadastra seus atletas',
    desc: 'Nome, foto e CPF. O sistema bloqueia duplicatas automaticamente.',
    badge: '✓ CPF verificado',
  },
  {
    num: '02',
    title: 'Você registra a graduação',
    desc: 'Seleciona o atleta, a nova faixa, a data e quem graduou. O sistema gera o hash e o QR em segundos.',
    badge: '🔒 Hash imutável',
  },
  {
    num: '03',
    title: 'Qualquer pessoa verifica',
    desc: 'Escaneie o QR. Cai na página pública do atleta. Histórico completo, assinado digitalmente.',
    badge: '⬛ Público · Auditável',
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="px-6 md:px-10"
      style={{
        background: 'var(--bg-2)',
        padding: '100px 40px',
        borderTop: '1px solid var(--border-2)',
      }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Label */}
        <div className="flex items-center" style={{ gap: 10, marginBottom: 20 }}>
          <div style={{ width: 20, height: 1.5, background: 'var(--terra)' }} />
          <span
            className="font-display"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
            }}
          >
            ◆ PROCESSO
          </span>
        </div>

        {/* H2 */}
        <h2
          className="font-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(32px, 4vw, 50px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--ink)',
            marginBottom: 48,
          }}
        >
          Três passos. Para sempre.
        </h2>

        {/* Desktop grid */}
        <div
          className="hidden md:grid md:grid-cols-3"
          style={{
            background: 'var(--border-2)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            gap: 1,
          }}
        >
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                background: 'var(--bg-2)',
                padding: '36px 32px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--white)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-2)';
              }}
            >
              <StepContent step={step} />
            </div>
          ))}
        </div>

        {/* Mobile stack */}
        <div className="md:hidden flex flex-col">
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                padding: '36px 0',
                borderBottom: i < steps.length - 1 ? '1px solid var(--border-2)' : 'none',
              }}
            >
              <StepContent step={step} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepContent({ step }: { step: typeof steps[number] }) {
  return (
    <>
      {/* Number */}
      <span
        className="font-display block"
        style={{
          fontWeight: 700,
          fontSize: 52,
          color: 'var(--blue-deep)',
          opacity: 0.2,
          lineHeight: 1,
          marginBottom: 20,
          letterSpacing: '-0.03em',
        }}
      >
        {step.num}
      </span>

      {/* Title */}
      <p
        className="font-display"
        style={{
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: '-0.01em',
          color: 'var(--ink)',
          lineHeight: 1.35,
          marginBottom: 10,
        }}
      >
        {step.title}
      </p>

      {/* Description */}
      <p
        className="font-body"
        style={{
          fontWeight: 400,
          fontSize: 13,
          color: 'var(--muted)',
          lineHeight: 1.7,
        }}
      >
        {step.desc}
      </p>

      {/* Badge */}
      <span
        className="font-display inline-flex items-center"
        style={{
          gap: 5,
          background: 'var(--blue-deep)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          padding: '4px 10px',
          borderRadius: 4,
          marginTop: 16,
        }}
      >
        {step.badge}
      </span>
    </>
  );
}
