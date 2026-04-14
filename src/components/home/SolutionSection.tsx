import { CheckCircle, Lock, Medal } from 'lucide-react';

const cards = [
  {
    icon: CheckCircle,
    iconBg: 'var(--blue-light)',
    iconColor: 'var(--blue-deep)',
    title: 'Verificação em 0,3 segundos',
    body: 'Escaneie o QR Code. Em instantes você vê o nome, a academia, todas as graduações e quem assinou cada uma.',
  },
  {
    icon: Lock,
    iconBg: 'rgba(216,66,26,0.1)',
    iconColor: 'var(--terra)',
    title: 'Imutável por criptografia',
    body: 'Cada graduação recebe um hash SHA-256 único. Ninguém — nem nós — pode alterar ou apagar.',
  },
  {
    icon: Medal,
    iconBg: 'var(--blue-light)',
    iconColor: 'var(--blue-deep)',
    title: 'Passaporte vitalício',
    body: 'O atleta leva o link e o QR para sempre. Mesmo que mude de academia. Mesmo que ela feche.',
  },
];

export function SolutionSection() {
  return (
    <section
      className="px-6 md:px-10"
      style={{
        background: 'var(--bg)',
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
            ◆ A SOLUÇÃO
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
            maxWidth: 520,
            marginBottom: 56,
          }}
        >
          O passaporte digital definitivo do seu atleta.
        </h2>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
          {cards.map((card) => (
            <div
              key={card.title}
              className="group"
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 24px',
                transition: 'var(--transition)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue-mid)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <card.icon size={22} color={card.iconColor} />
              </div>

              {/* Title */}
              <p
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: '-0.01em',
                  color: 'var(--ink)',
                  margin: '16px 0 10px',
                }}
              >
                {card.title}
              </p>

              {/* Body */}
              <p
                className="font-body"
                style={{
                  fontWeight: 400,
                  fontSize: 14,
                  color: 'var(--muted)',
                  lineHeight: 1.7,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
