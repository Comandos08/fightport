# PRD Completo do FightPort — Documento Único (Markdown)

## Objetivo
Produzir um único arquivo `fightport-prd.md` em `/mnt/documents/` contendo toda a especificação necessária para replicar o sistema de forma idêntica, sem limite de páginas.

## Escopo do documento
O PRD será extraído diretamente do código-fonte e do schema atual do banco, organizado nas seguintes seções:

1. **Visão geral do produto** — proposta, público (escolas de artes marciais), modelo de negócio (créditos por graduação, pacotes Starter/Equipe/Organização via MercadoPago).
2. **Personas e papéis** — Escola, Administrador da plataforma, Praticante (público), Visitante.
3. **Mapa de rotas** — todas as 25+ rotas (`/`, `/p/:id`, `/cadastro`, `/login`, `/painel/*`, `/dash/*`, páginas institucionais) com descrição funcional de cada uma.
4. **Fluxos de usuário** — cadastro/login, recuperação de senha, cadastro de praticante, registro de conquista (consumo de crédito), compra de créditos, suporte, suspensão, administração.
5. **Especificação por tela** — para cada página: propósito, componentes, estados, validações, mensagens, ações, regras de acesso.
6. **Sistema de design** — tokens (cores, tipografia Syncopate, espaçamentos, raios), componentes shadcn customizados, padrões mobile-first.
7. **Modelo de dados completo** — DDL de cada tabela (`schools`, `practitioners`, `achievements`, `credits`, `credit_transactions`, `head_coaches`, `notifications`, `support_tickets`, `support_messages`, `school_audit_log`, `admin_audit_log`, `contact_submissions`, `email_send_log`) com colunas, tipos, defaults, nullability.
8. **RLS, GRANTs e políticas** — todas as policies por tabela.
9. **Funções, triggers e RPCs** — `has_role`/`is_admin`, `mark_messages_read`, `admin_list_support_tickets`, `admin_resolve_ticket`, gatilhos de auditoria, geração de `fp_id`, hash de conquista, etc.
10. **Lógicas e cálculos** — regra de consumo de créditos por graduação, geração de hash de verificação, geração de FP ID, regras de suspensão, contagem de não lidos, status de tickets, máscara de CPF.
11. **Edge functions** — contrato completo de `mercadopago-checkout`, `mercadopago-webhook`, `send-contact-email`, `send-email`, `og-passport` (entradas, saídas, secrets, rate limits, retries, side-effects no DB).
12. **Pacotes de crédito e preços** — Starter (10/R$97), Equipe (50/R$397), Organização (150/R$990).
13. **Autenticação e segurança** — Supabase Auth, confirmação de e-mail, rotas protegidas, papel admin, política de senhas, RLS, secrets.
14. **Notificações e e-mails** — tipos permitidos, templates, gatilhos, integração Resend.
15. **Internacionalização** — pt-BR / en / es, chaves principais.
16. **SEO e meta** — títulos, descrições, OG, sitemap, robots, página `/p/:id` pública.
17. **Exportações e importações** — CSV de praticantes (com CPF), importação em massa.
18. **Painel administrativo (/dash)** — todas as telas de organizacoes/atletas/graduações/financeiro/suporte/contatos/auditoria.
19. **Infraestrutura** — stack (React 18, Vite, Tailwind, TS, Supabase/Lovable Cloud), variáveis de ambiente, deploy.
20. **Regras de negócio e constraints** — qualidade, mobile-first, contraste, escola "Academia Teste" intencional.
21. **Critérios de aceite por feature** — checklist replicável.
22. **Apêndices** — DDL completo consolidado, exemplos de payloads, glossário.

## Como será produzido
- Leitura ampla do código (`src/pages/**`, `src/components/**`, `supabase/functions/**`, `src/i18n/locales/pt-BR.json`, `supabase/config.toml`).
- Consulta ao schema atual via `supabase--read_query` (information_schema, pg_policies, pg_proc, pg_trigger) para extrair DDL, policies, funções e triggers exatos.
- Escrita em um único arquivo Markdown longo em `/mnt/documents/fightport-prd.md`, sem limite de páginas, com sumário no topo e seções numeradas.
- Entrega via `<presentation-artifact>` para download.

## Entregável
- `fightport-prd.md` único, autocontido, suficiente para uma equipe nova reconstruir o FightPort idêntico ao atual.

## Fora do escopo
- Nenhuma alteração de código ou de banco.
- Sem múltiplos arquivos — apenas o `.md` único conforme solicitado.
