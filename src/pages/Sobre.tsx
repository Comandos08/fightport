import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { FooterSection } from '@/components/home/FooterSection';
import { useSeo } from '@/hooks/useSeo';

const stats = [
  { value: '72%', label: 'das organizações ainda usam certificados físicos sem respaldo digital' },
  { value: '50%', label: 'dos árbitros não conseguem verificar graduações em competições' },
  { value: '5 anos', label: 'de treino registrados em papel que pode ser perdido ou falsificado' },
];

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#F97316',
  marginBottom: 16,
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 28,
  fontWeight: 700,
  color: 'var(--color-text)',
  lineHeight: 1.3,
  marginBottom: 24,
  letterSpacing: '-0.02em',
  maxWidth: 600,
};

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 16,
  lineHeight: 1.85,
  color: 'var(--color-text-muted)',
  marginBottom: 20,
};

function Section({
  bg,
  label,
  heading,
  paragraphs,
  children,
  showBackLink,
}: {
  bg: 'white' | 'gray';
  label: string;
  heading: string;
  paragraphs: string[];
  children?: React.ReactNode;
  showBackLink?: boolean;
}) {
  return (
    <section style={{ background: bg === 'gray' ? '#F9F9F9' : '#FFFFFF', padding: '80px 0' }}>
      <div className="fp-container" style={{ maxWidth: 760, margin: '0 auto' }}>
        {showBackLink && (
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 48,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            ← voltar ao início
          </Link>
        )}
        <p style={labelStyle}>{label}</p>
        <h2 style={sectionHeadingStyle}>{heading}</h2>
        {paragraphs.map((p, i) => (
          <p key={i} style={bodyStyle}>{p}</p>
        ))}
        {children}
      </div>
    </section>
  );
}

export default function Sobre() {
  useSeo({
    title: 'Sobre nós — fightport.pro',
    description: 'Conheça o fightport.pro: a infraestrutura de confiança para certificação esportiva nas artes marciais.',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--color-text)', padding: '80px 0 60px', textAlign: 'center' }}>
        <div className="fp-container">
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 400,
              fontSize: 'clamp(32px, 4vw, 52px)',
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
              color: '#FFFFFF',
              maxWidth: 460,
              margin: '0 auto',
            }}
          >
            Sobre nós
          </h1>
        </div>
      </section>

      {/* Section 1 */}
      <Section
        bg="white"
        label="NOSSA MISSÃO"
        heading="Construímos a infraestrutura de confiança para as artes marciais."
        paragraphs={[
          'Faixas levam anos para ser conquistadas. Horas de treino, superação e dedicação ficam registradas no corpo — mas raramente em algum lugar que resista ao tempo ou possa ser verificado por qualquer pessoa, em qualquer lugar do mundo.',
          'O fightport.pro nasceu para mudar isso. Criamos um sistema onde cada graduação se torna um registro permanente, criptografado e verificável publicamente em menos de um segundo. Sem papéis que se perdem. Sem certificados que se falsificam. Sem dúvidas sobre a trajetória de um atleta.',
        ]}
        showBackLink
      />

      {/* Section 2 */}
      <Section
        bg="gray"
        label="O PROBLEMA QUE RESOLVEMOS"
        heading="Certificados físicos são fáceis de falsificar. Registros digitais, não."
        paragraphs={[
          'O mercado de artes marciais no Brasil movimenta bilhões de reais e conta com mais de 2 milhões de praticantes ativos. Mas a certificação de graduações ainda funciona como há décadas: um papel impresso, uma assinatura e um carimbo.',
          'Árbitros de competições, empregadores, outras academias — qualquer pessoa que precise verificar a graduação de um atleta não tem como fazer isso com segurança. O fightport.pro resolve esse problema com criptografia SHA-256 e QR Codes verificáveis por qualquer pessoa, em qualquer dispositivo, sem precisar de conta ou aplicativo.',
        ]}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginTop: 40,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '28px 24px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 32,
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--color-text-muted)',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 3 */}
      <Section
        bg="white"
        label="COMO FUNCIONA"
        heading="Simples para a academia. Definitivo para o atleta."
        paragraphs={[
          'A organização cadastra seus praticantes, registra a graduação e gera automaticamente um passaporte digital com QR Code. O processo leva menos de dois minutos. O registro dura para sempre.',
          'Cada graduação recebe um hash SHA-256 único, calculado no momento do registro. Qualquer alteração posterior — mesmo mínima — produziria um hash completamente diferente, tornando a adulteração detectável imediatamente. É a mesma tecnologia usada para garantir a integridade de transações financeiras digitais.',
        ]}
      />

      {/* Section 4 */}
      <Section
        bg="gray"
        label="QUEM SOMOS"
        heading="Uma empresa brasileira construída para o esporte nacional."
        paragraphs={[
          'O fightport.pro é desenvolvido pela SportCombat, empresa com sede no Rio de Janeiro — RJ, focada em soluções de tecnologia para o ecossistema esportivo brasileiro.',
          'Operamos sob a Lei Geral de Proteção de Dados (LGPD) e levamos a sério a responsabilidade de guardar informações de atletas. Todos os dados são armazenados em infraestrutura segura, criptografados em trânsito e em repouso.',
          'Estamos presentes em organizações em São Paulo, Rio de Janeiro, Curitiba, Belo Horizonte, Porto Alegre, Fortaleza e Recife — e crescendo.',
        ]}
      />

      {/* CTA */}
      <section style={{ background: 'var(--color-text)', padding: '80px 0', textAlign: 'center' }}>
        <div className="fp-container" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 28,
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Sua organização merece isso.
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              color: 'rgba(255,255,255,0.55)',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Cadastre grátis. Você só paga quando graduar um atleta.
          </p>
          <Link
            to="/cadastro"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 400,
              color: '#000000',
              background: '#F97316',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 32px',
              textDecoration: 'none',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Cadastrar minha organização
          </Link>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
