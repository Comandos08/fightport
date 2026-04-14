import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { FooterSection } from '@/components/home/FooterSection';
import { useSeo } from '@/hooks/useSeo';

const sections = [
  {
    title: '1. Quem somos',
    content: 'O fightport.pro é operado pela SportCombat, empresa com sede no Rio de Janeiro — RJ, Brasil. Esta Política descreve como coletamos, usamos, armazenamos e protegemos os dados pessoais de nossos Usuários e dos praticantes por eles cadastrados, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).',
  },
  {
    title: '2. Dados que coletamos',
    content: '',
    subsections: [
      {
        subtitle: '2.1. Dados das organizações (Usuários da Plataforma):',
        items: [
          'Nome da organização e do responsável (Head Coach)',
          'Endereço de e-mail e senha (armazenada em hash)',
          'Cidade e estado',
          'Arte marcial principal e graduação do responsável',
          'Histórico de transações de créditos',
        ],
      },
      {
        subtitle: '2.2. Dados dos praticantes (inseridos pelas organizações):',
        items: [
          'Nome completo e sobrenome',
          'CPF',
          'Data de nascimento e sexo',
          'Nome do pai e da mãe (opcional)',
          'Histórico de graduações e faixas',
        ],
      },
      {
        subtitle: '2.3. Dados coletados automaticamente:',
        items: [
          'Endereço IP e dados de acesso (logs)',
          'Tipo de dispositivo e navegador',
          'Páginas visitadas e tempo de sessão',
        ],
      },
    ],
  },
  {
    title: '3. Finalidade do Tratamento',
    content: 'Utilizamos os dados para:',
    items: [
      'Prestação do serviço de certificação digital',
      'Geração de hash SHA-256 e emissão de passaportes digitais',
      'Exibição pública do passaporte do praticante mediante acesso ao QR Code',
      'Comunicação sobre o serviço (atualizações, avisos técnicos)',
      'Cumprimento de obrigações legais e regulatórias',
      'Melhoria contínua da Plataforma',
    ],
  },
  {
    title: '4. Base Legal (LGPD)',
    content: 'O tratamento de dados está fundamentado nas seguintes bases legais:',
    items: [
      'Execução de contrato (Art. 7º, V): para prestação do serviço contratado',
      'Consentimento (Art. 7º, I): para dados dos praticantes, cujo consentimento deve ser obtido pela organização',
      'Legítimo interesse (Art. 7º, IX): para segurança, prevenção de fraudes e melhoria do serviço',
      'Cumprimento de obrigação legal (Art. 7º, II): quando exigido por lei',
    ],
  },
  {
    title: '5. Compartilhamento de Dados',
    content: 'Não vendemos nem cedemos dados pessoais a terceiros para fins comerciais. Os dados podem ser compartilhados com:',
    items: [
      'Provedores de infraestrutura técnica (hospedagem, banco de dados, autenticação) sob acordos de confidencialidade',
      'Autoridades públicas, quando exigido por lei ou ordem judicial',
    ],
    extra: 'O passaporte digital do praticante (nome, arte marcial, faixa atual e histórico de graduações) é público e acessível por qualquer pessoa que tenha o QR Code ou o ID do praticante. A organização é responsável por informar o praticante sobre essa característica do serviço.',
  },
  {
    title: '6. Retenção de Dados',
    content: 'Os dados são mantidos enquanto a conta da organização estiver ativa. Após o encerramento da conta, os dados são retidos por até 5 (cinco) anos para cumprimento de obrigações legais, após o que são anonimizados ou excluídos. Os passaportes digitais públicos já emitidos são mantidos indefinidamente para garantir a imutabilidade do registro, salvo solicitação fundamentada de exclusão pelo titular.',
  },
  {
    title: '7. Direitos do Titular',
    content: 'Nos termos da LGPD, o titular dos dados tem direito a:',
    items: [
      'Confirmação da existência de tratamento',
      'Acesso aos dados',
      'Correção de dados incompletos, inexatos ou desatualizados',
      'Anonimização, bloqueio ou eliminação de dados desnecessários',
      'Portabilidade dos dados',
      'Eliminação dos dados tratados com base no consentimento',
      'Informação sobre compartilhamento',
      'Revogação do consentimento',
    ],
    extra: 'Para exercer seus direitos, o titular deve entrar em contato com a organização que realizou seu cadastro ou diretamente com a SportCombat pelo e-mail que será disponibilizado na página de Contato.',
  },
  {
    title: '8. Segurança',
    content: 'Adotamos medidas técnicas e organizacionais para proteger os dados, incluindo: criptografia em trânsito (TLS/HTTPS), hash SHA-256 para integridade dos registros, autenticação segura com senhas em hash, controle de acesso por perfil e monitoramento de atividades suspeitas. Em caso de incidente de segurança que possa acarretar risco aos titulares, notificaremos a ANPD e os afetados nos prazos legais.',
  },
  {
    title: '9. Cookies',
    content: 'Utilizamos cookies estritamente necessários para o funcionamento da Plataforma (sessão e autenticação). Não utilizamos cookies de rastreamento ou publicidade. Ao continuar usando a Plataforma, você concorda com o uso desses cookies essenciais.',
  },
  {
    title: '10. Alterações nesta Política',
    content: 'Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas por e-mail ou aviso na Plataforma com antecedência mínima de 15 dias. O uso continuado da Plataforma após as alterações implica aceitação da nova versão.',
  },
  {
    title: '11. Contato e Encarregado (DPO)',
    content: 'Para dúvidas, solicitações ou reclamações relacionadas à privacidade e proteção de dados, entre em contato com a SportCombat através do e-mail que será disponibilizado na página de Contato da Plataforma. A SportCombat designará um Encarregado de Proteção de Dados (DPO) conforme exigido pela LGPD.',
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

export default function Privacidade() {
  useSeo({
    title: 'Política de Privacidade — fightport.pro',
    description: 'Política de Privacidade do fightport.pro. Saiba como coletamos, usamos e protegemos seus dados.',
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
            Política de Privacidade
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
            POLÍTICA DE PRIVACIDADE — FIGHTPORT.PRO
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {sections.map((section, i) => (
              <div key={i}>
                <h2 style={headingStyle}>{section.title}</h2>

                {section.content && <p style={textStyle}>{section.content}</p>}

                {section.subsections?.map((sub, j) => (
                  <div key={j} style={{ marginTop: 20 }}>
                    <p style={{ ...textStyle, fontWeight: 600, marginBottom: 8 }}>{sub.subtitle}</p>
                    <ul style={{ ...textStyle, paddingLeft: 20, listStyleType: 'disc' }}>
                      {sub.items.map((item, k) => (
                        <li key={k} style={{ marginBottom: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {section.items && (
                  <ul style={{ ...textStyle, paddingLeft: 20, listStyleType: 'disc', marginTop: 12 }}>
                    {section.items.map((item, k) => (
                      <li key={k} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.extra && (
                  <p style={{ ...textStyle, marginTop: 16 }}>{section.extra}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
