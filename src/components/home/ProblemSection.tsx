export function ProblemSection() {
  return (
    <section
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
            ◆ O PROBLEMA
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
            maxWidth: 560,
            marginBottom: 32,
          }}
        >
          Certificados físicos são fáceis de falsificar.
        </h2>

        {/* Body */}
        <div className="flex flex-col" style={{ gap: 16, maxWidth: 600 }}>
          {[
            'Qualquer academia emite qualquer certificado. Não existe verificação nacional.',
            'Árbitros aceitam faixas sem questionar. Campeonatos têm atletas na categoria errada.',
            'Seu aluno leva anos para chegar na faixa preta. E qualquer um pode imprimir uma.',
          ].map((text, i) => (
            <p
              key={i}
              className="font-body"
              style={{
                fontSize: 17,
                fontWeight: 400,
                color: 'var(--muted)',
                lineHeight: 1.75,
              }}
            >
              {text}
            </p>
          ))}
        </div>

        {/* Closing */}
        <p
          className="font-display"
          style={{
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 24,
            color: 'var(--blue-deep)',
            marginTop: 40,
          }}
        >
          Isso acaba agora.
        </p>
      </div>
    </section>
  );
}
