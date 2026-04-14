import { Navbar } from '@/components/layout/Navbar';
import { FooterSection } from '@/components/home/FooterSection';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: 'Ao acessar ou utilizar a plataforma fightport.pro ("Plataforma"), você ("Usuário") concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, não utilize a Plataforma. A SportCombat reserva-se o direito de atualizar estes Termos a qualquer momento, sendo as alterações comunicadas por e-mail ou aviso na Plataforma.',
  },
  {
    title: '2. Descrição do Serviço',
    content: 'O fightport.pro é uma plataforma de certificação digital de graduações em artes marciais. O serviço permite que organizações esportivas cadastrem praticantes, registrem graduações com geração de hash criptográfico SHA-256 e emitam passaportes digitais verificáveis por QR Code. O fightport.pro não é uma entidade certificadora oficial de artes marciais e não possui vínculo com federações ou confederações esportivas, salvo quando expressamente indicado.',
  },
  {
    title: '3. Cadastro e Conta',
    content: `3.1. Para utilizar os recursos da Plataforma, a organização deve criar uma conta fornecendo informações verídicas e atualizadas.

3.2. O Usuário é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.

3.3. É vedado compartilhar credenciais de acesso com terceiros não autorizados.

3.4. A SportCombat pode suspender ou encerrar contas que violem estes Termos, sem aviso prévio.`,
  },
  {
    title: '4. Créditos e Pagamentos',
    content: `4.1. O fightport.pro opera em modelo pay-per-use mediante compra de créditos. Cada graduação registrada consome 1 (um) crédito.

4.2. Os créditos adquiridos não possuem prazo de validade e não são reembolsáveis, salvo em caso de erro técnico comprovado da Plataforma.

4.3. Os valores dos pacotes de créditos podem ser alterados a qualquer momento, sem aviso prévio, sendo garantido ao Usuário o uso dos créditos já adquiridos pelo valor vigente no momento da compra.

4.4. Não há cobrança de mensalidade, taxa de adesão ou cancelamento.`,
  },
  {
    title: '5. Dados dos Praticantes e Responsabilidade da Organização',
    content: `5.1. A organização ("Controlador de Dados") é integralmente responsável por obter o consentimento dos praticantes cadastrados para o tratamento de seus dados pessoais, incluindo nome, CPF, data de nascimento e filiação, conforme exigido pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

5.2. A SportCombat atua como Operadora de Dados nos termos da LGPD, processando os dados exclusivamente conforme as instruções da organização e para as finalidades descritas na Política de Privacidade.

5.3. A organização declara ter autorização legal para cadastrar os dados dos praticantes na Plataforma.`,
  },
  {
    title: '6. Propriedade Intelectual',
    content: `6.1. Todo o conteúdo da Plataforma, incluindo marca, logotipo, software, layout e textos, é de propriedade exclusiva da SportCombat ou de seus licenciantes.

6.2. É vedada a reprodução, modificação, distribuição ou uso comercial de qualquer conteúdo da Plataforma sem autorização prévia e expressa da SportCombat.`,
  },
  {
    title: '7. Limitação de Responsabilidade',
    content: 'A SportCombat não se responsabiliza por: (i) uso indevido dos certificados digitais emitidos; (ii) informações incorretas fornecidas pelas organizações; (iii) decisões tomadas por terceiros com base nos certificados; (iv) interrupções temporárias do serviço por manutenção ou falhas técnicas.',
  },
  {
    title: '8. Rescisão',
    content: 'O Usuário pode encerrar sua conta a qualquer momento mediante solicitação pelo e-mail de contato. Os dados serão tratados conforme a Política de Privacidade. A SportCombat pode encerrar contas em caso de violação destes Termos.',
  },
  {
    title: '9. Lei Aplicável e Foro',
    content: 'Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca do Rio de Janeiro — RJ para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.',
  },
  {
    title: '10. Contato',
    content: 'Para dúvidas sobre estes Termos, entre em contato com a SportCombat através do e-mail que será disponibilizado na página de Contato da Plataforma.',
  },
];

export default function TermosDeUso() {
  useSeo({
    title: 'Termos de Uso — fightport.pro',
    description: 'Termos de Uso da plataforma fightport.pro. Certificação digital de graduações em artes marciais.',
    url: 'https://fightport.lovable.app/termos',
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--color-bg-dark)', padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', marginBottom: 20,
          }}>
            TERMOS DE USO — FIGHTPORT.PRO
          </p>
          <h1 style={{
            fontFamily: 'var(--font-sans)', fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-0.03em',
            color: '#FFFFFF', marginBottom: 12,
          }}>
            Termos de Uso
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 300,
            color: 'rgba(255,255,255,0.5)',
          }}>
            Última atualização: abril de 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ background: 'var(--color-bg)', padding: '64px 24px 96px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link
            to="/"
            className="inline-flex items-center"
            style={{
              gap: 6, fontFamily: 'var(--font-sans)', fontSize: 13,
              fontWeight: 400, color: 'var(--color-text-muted)',
              textDecoration: 'none', marginBottom: 48, display: 'inline-flex',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Voltar ao início
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {sections.map((section) => (
              <div key={section.title}>
                <h2 style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 600,
                  fontSize: 18, color: 'var(--color-text)',
                  letterSpacing: '-0.01em', marginBottom: 16,
                }}>
                  {section.title}
                </h2>
                <div style={{
                  fontFamily: 'var(--font-sans)', fontSize: 15,
                  fontWeight: 300, color: 'var(--color-text-muted)',
                  lineHeight: 1.75, whiteSpace: 'pre-line',
                }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
