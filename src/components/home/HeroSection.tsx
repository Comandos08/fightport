import { Link } from 'react-router-dom';

function HeroPassportCard() {
  return (
    <div
      className="animate-float"
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: 300,
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden',
      }}
    >
      {/* Terra bar */}
      <div
        style={{
          height: 3,
          background: 'linear-gradient(90deg, var(--terra), var(--terra-soft), transparent)',
        }}
      />

      {/* Header */}
      <div
        style={{
          background: 'var(--blue-deep)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          className="font-display"
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          FightPort · Passaporte Digital
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            className="animate-pulse-dot"
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#c8f135',
            }}
          />
          <span
            className="font-display"
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Verificado
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 18 }}>
        {/* Athlete */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="font-display"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--terra-soft), var(--terra))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            CM
          </div>
          <div>
            <p
              className="font-display"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}
            >
              Carlos E. Mendes Silva
            </p>
            <p
              className="font-body"
              style={{ fontSize: 11, fontWeight: 400, color: 'var(--muted)' }}
            >
              Academia Tiger BJJ · Jiu-Jitsu
            </p>
          </div>
        </div>

        {/* Belts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {/* Roxa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
            <span
              className="font-display"
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: '#7c3aed',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 100,
              }}
            >
              Roxa
            </span>
            <span
              className="font-display"
              style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 'auto' }}
            >
              2023
            </span>
          </div>
          {/* Azul */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue-deep)', flexShrink: 0 }} />
            <span
              className="font-display"
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'var(--blue-deep)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 100,
              }}
            >
              Azul
            </span>
            <span
              className="font-display"
              style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 'auto' }}
            >
              2021
            </span>
          </div>
          {/* Branca */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border-2)', flexShrink: 0 }} />
            <span
              className="font-display"
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'var(--bg-2)',
                color: 'var(--muted)',
                border: '1px solid var(--border-2)',
                padding: '2px 8px',
                borderRadius: 100,
              }}
            >
              Branca
            </span>
            <span
              className="font-display"
              style={{ fontSize: 9, color: 'var(--muted)', marginLeft: 'auto' }}
            >
              2019
            </span>
          </div>
        </div>

        {/* Hash */}
        <div
          style={{
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          <span
            className="font-display"
            style={{
              fontSize: 8.5,
              fontWeight: 400,
              color: 'var(--cloud)',
              letterSpacing: '0.04em',
            }}
          >
            ID: FP-2024-246861 · 7c9a31fe...f2d18e90 · SHA-256
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-[55fr_45fr]"
      style={{ minHeight: 'calc(100vh - 62px)' }}
    >
      {/* Left side */}
      <div
        className="flex flex-col justify-center px-6 py-12 md:px-10 md:py-[72px] md:pr-[52px]"
        style={{ background: 'var(--bg)' }}
      >
        {/* Eyebrow */}
        <div
          className="animate-fadeup delay-0 flex items-center"
          style={{ gap: 10, marginBottom: 22 }}
        >
          <div style={{ width: 20, height: 1.5, background: 'var(--terra)' }} />
          <span
            className="font-display"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
            }}
          >
            ◆ CERTIFICAÇÃO ESPORTIVA DIGITAL
          </span>
        </div>

        {/* H1 */}
        <h1
          className="animate-fadeup delay-100 font-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(42px, 5.5vw, 68px)',
            lineHeight: 1.04,
            letterSpacing: '-0.025em',
            margin: 0,
          }}
        >
          <span style={{ color: 'var(--ink)' }}>A GRADUAÇÃO</span>
          <br />
          <span style={{ fontStyle: 'italic', color: 'var(--blue-mid)' }}>do seu atleta,</span>
          <br />
          <span style={{ color: 'var(--blue-deep)' }}>IMUTÁVEL.</span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fadeup delay-200 font-body"
          style={{
            fontSize: 17,
            fontWeight: 400,
            color: 'var(--muted)',
            lineHeight: 1.72,
            maxWidth: 440,
            margin: '20px 0 36px',
          }}
        >
          Qualquer pessoa no mundo verifica a faixa do seu aluno
          em 3 segundos — com um simples escaneamento de QR Code.
          Para sempre. Sem falsificação possível.
        </p>

        {/* Buttons */}
        <div
          className="animate-fadeup delay-300 flex flex-wrap"
          style={{ gap: 12 }}
        >
          <Link
            to="/cadastro"
            className="font-display inline-flex items-center"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#ffffff',
              background: 'var(--blue-deep)',
              border: '2px solid var(--blue-deep)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 26px',
              gap: 8,
              textDecoration: 'none',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--blue-mid)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-btn)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--blue-deep)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Cadastrar minha academia — é grátis
          </Link>

          <a
            href="/#busca"
            className="font-display"
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              background: 'transparent',
              border: '1.5px solid var(--border-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '13px 22px',
              textDecoration: 'none',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-3)';
              e.currentTarget.style.borderColor = 'var(--ink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-2)';
            }}
          >
            Verificar um atleta →
          </a>
        </div>

        {/* Stats */}
        <div
          className="animate-fadeup delay-400 flex"
          style={{
            gap: 36,
            borderTop: '1px solid var(--border-2)',
            paddingTop: 28,
            marginTop: 52,
          }}
        >
          {[
            { number: '1.247', suffix: '+', label: 'atletas' },
            { number: '89', suffix: '', label: 'escolas' },
            { number: '3.891', suffix: '', label: 'certificados' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                className="font-display"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--blue-deep)',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.number}
                {stat.suffix && (
                  <sup style={{ fontSize: 13, color: 'var(--terra)' }}>{stat.suffix}</sup>
                )}
              </span>
              <span
                className="font-body"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  marginTop: 4,
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side */}
      <div
        className="flex flex-col items-center justify-center relative overflow-hidden px-6 py-10 md:px-11 md:py-[60px] min-h-[420px]"
        style={{
          background: 'var(--blue-deep)',
          gap: 20,
        }}
      >
        {/* Glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(216,66,26,0.18)',
            filter: 'blur(60px)',
          }}
        />

        {/* Pill */}
        <div
          className="self-end font-display"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.20)',
            borderRadius: 100,
            padding: '7px 16px 7px 8px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#ffffff',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#c8f135',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#000',
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          Verificado em 0,3s
        </div>

        {/* Card */}
        <div className="w-full flex justify-center" style={{ maxWidth: 300 }}>
          <HeroPassportCard />
        </div>
      </div>
    </section>
  );
}
