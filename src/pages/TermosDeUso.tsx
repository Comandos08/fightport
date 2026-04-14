import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { FooterSection } from '@/components/home/FooterSection';
import { useSeo } from '@/hooks/useSeo';

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: 'Ao acessar ou utilizar a plataforma fightport.pro ("Plataforma"), operada pela SportCombat, você ("Usuário") concorda integralmente com estes Termos de Uso. Se não concordar com qualquer disposição, não utilize a Plataforma.',
  },
  {
    title: '2. Definições',
    items: [
      'Plataforma: o sistema web fightport.pro e todos os seus serviços associados.',
      'Usuário: a organização esportiva (academia, federação, confederação ou associação) que se cadastra na Plataforma e administra os dados de seus praticantes.',
      'Praticante: o atleta cujos dados são inseridos pelo Usuário para fins de certificação digital.',
      'Passaporte Digital: o documento público gerado pela Plataforma contendo as informações e graduações do praticante.',
      'Créditos: unidades digitais adquiridas pelo Usuário para registrar graduações na Plataforma.',
    ],
  },
  {
    title: '3. Serviço Oferecido',
    content: 'O fightport.pro é uma plataforma de certificação esportiva digital que permite a organizações de artes marciais registrar graduações de seus praticantes, gerar passaportes digitais verificáveis e manter um histórico imutável de conquistas. O Usuário é o único responsável pela veracidade dos dados inseridos.',
  },
  {
    title: '4. Cadastro e Conta',
    content: 'Para utilizar a Plataforma, o Usuário deve criar uma conta informando dados válidos. O Usuário é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta. A SportCombat reserva-se o direito de recusar, suspender ou encerrar contas que violem estes Termos.',
  },
  {
    title: '5. Créditos e Pagamento',
    content: 'O cadastro na Plataforma é gratuito. Para registrar graduações, o Usuário deve adquirir créditos através dos pacotes disponíveis. Cada registro de graduação consome 1 (um) crédito. Créditos adquiridos não são reembolsáveis, salvo em caso de falha técnica comprovada da Plataforma. Os preços podem ser alterados a qualquer momento, sem efeito retroativo sobre créditos já adquiridos.',
  },
  {
    title: '6. Uso Aceitável',
    content: 'O Usuário compromete-se a:',
    items: [
      'Utilizar a Plataforma apenas para fins legítimos de certificação esportiva',
      'Inserir apenas dados verdadeiros e verificáveis de seus praticantes',
      'Obter o consentimento dos praticantes (ou de seus responsáveis legais, no caso de menores) antes de cadastrar seus dados',
      'Não utilizar a Plataforma para qualquer atividade ilegal, fraudulenta ou que viole direitos de terceiros',
      'Não tentar acessar áreas restritas, sistemas ou dados de outros Usuários',
    ],
  },
  {
    title: '7. Propriedade Intelectual',
    content: 'Todo o conteúdo da Plataforma (marca, design, código, textos e funcionalidades) é de propriedade da SportCombat e protegido pela legislação brasileira de propriedade intelectual. Os dados inseridos pelo Usuário permanecem de sua titularidade, sendo concedida à SportCombat licença para processá-los e exibi-los conforme a finalidade do serviço.',
  },
  {
    title: '8. Limitação de Responsabilidade',
    content: 'A SportCombat não se responsabiliza por: dados incorretos inseridos pelo Usuário; uso indevido das credenciais de acesso; interrupções temporárias do serviço para manutenção ou por motivos de força maior; decisões tomadas por terceiros com base nas informações do passaporte digital. A Plataforma é fornecida "como está". A responsabilidade da SportCombat é limitada ao valor pago pelo Usuário nos 12 meses anteriores ao evento que deu origem à reclamação.',
  },
  {
    title: '9. Privacidade e Proteção de Dados',
    content: 'O tratamento de dados pessoais pela Plataforma é regido pela nossa Política de Privacidade. A SportCombat pode encerrar contas em caso de violação destes Termos.',
  },
  {
    title: '10. Lei Aplicável e Foro',
    content: 'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca do Rio de Janeiro — RJ para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.',
  },
  {
    title: '11. Contato',
    content: 'Para dúvidas sobre estes Termos, entre em contato com a SportCombat através do e-mail que será disponibilizado na página de Contato da Plataforma.',
  },
];

const textStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 15,
  lineHeight: 1.8,
  color: 'var(--color-text-muted)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--color-text)',
  marginBottom: 12,
  letterSpacing: '-0.01em',
};

export default function TermosDeUso() {
  useSeo({
    title: 'Termos de Uso — fightport.pro',
    description: 'Termos de Uso do fightport.pro. Leia as condições de uso da plataforma de certificação esportiva.',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: 'var(--color-text)',
          padding: '80px 0 60px',
          textAlign: 'center',
        }}
      >
        <div className="fp-container">
          <h1
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 32,
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}
          >
            Termos de Uso
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            Última atualização: abril de 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ flex: 1, background: '#FFFFFF', padding: '48px 0 80px' }}>
        <div className="fp-container" style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 40,
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            ← voltar ao início
          </Link>

          <p
            style={{
              ...textStyle,
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-light)',
              marginBottom: 48,
            }}
          >
            TERMOS DE USO — FIGHTPORT.PRO
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {sections.map((section, i) => (
              <div key={i}>
                <h2 style={headingStyle}>{section.title}</h2>
                {section.content && <p style={textStyle}>{section.content}</p>}
                {section.items && (
                  <ul style={{ ...textStyle, paddingLeft: 20, listStyleType: 'disc', marginTop: 12 }}>
                    {section.items.map((item, k) => (
                      <li key={k} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
