

# Edge function genérica `send-email` + tabela de log

Escopo cirúrgico: criar **um único arquivo novo** (`supabase/functions/send-email/index.ts`). A tabela `email_send_log` é responsabilidade do usuário (executará o SQL manualmente no Supabase). Nada existente é tocado.

## O que a função faz

POST com body:
```ts
{ to: string, subject: string, html: string, replyTo?: string, idempotencyKey?: string }
```

Fluxo:
1. **CORS preflight** (`OPTIONS`) → 204 com headers completos.
2. **Validação**: `to`, `subject`, `html` obrigatórios e strings não-vazias. Falha → 400.
3. **Chama Resend** (`POST https://api.resend.com/emails`) com:
   - `from: "FightPort <noreply@fightport.pro>"`
   - `to: [to]`, `subject`, `html`
   - `reply_to: replyTo` se fornecido
4. **Grava em `email_send_log`** via service-role client (best-effort, falha de log não derruba a resposta):
   - sucesso → `status: 'sent'`, `resend_message_id: <id>`
   - falha do Resend → `status: 'failed'`, `error_message: <texto>`
5. **Resposta**:
   - Resend ok → `200 { success: true, messageId }`
   - Resend não-ok → `502 { success: false, error }`
   - Exceção → `500 { error: msg }` (com `error instanceof Error ? error.message : String(error)`)

## CORS

Headers em **todas** as respostas (sucesso, erro, preflight):
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version
```

## Segurança / configuração

- `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — todos já existem como secrets (verificado).
- `idempotencyKey` aceito no contrato mas **não usado nesta versão** (placeholder para futuro — nada de schema agora).
- `verify_jwt` fica no padrão Lovable (`false`) — não vou tocar `supabase/config.toml`. A função é genérica e pode ser chamada por outras edge functions ou pelo frontend autenticado.
- Tratamento de erro com `error instanceof Error ? error.message : String(error)` em todos os catches.

## Pré-requisito (responsabilidade do usuário, fora do código)

Criar a tabela `email_send_log` no SQL Editor do Supabase. Esquema esperado pela função (use exatamente estes nomes de coluna para a função funcionar sem ajuste):

```sql
create table public.email_send_log (
  id uuid primary key default gen_random_uuid(),
  "to" text not null,
  subject text not null,
  status text not null check (status in ('sent','failed')),
  resend_message_id text,
  error_message text,
  created_at timestamptz not null default now()
);

alter table public.email_send_log enable row level security;

-- Sem políticas públicas: só o service role (usado pela edge function) pode ler/escrever.
-- Opcional: política para admins lerem.
create policy "Admins can read email log"
  on public.email_send_log for select
  to authenticated
  using (public.is_admin(auth.uid()));
```

Se a estrutura/nomes diferirem, me avise para ajustar o INSERT na função.

## Domínio no Resend

Para `noreply@fightport.pro` realmente entregar, `fightport.pro` precisa estar verificado no Resend (SPF + DKIM no DNS). Enquanto não estiver, a função vai retornar 502 com o erro real do Resend (e gravar `failed` no log) — comportamento correto, sem mascarar.

## Arquivos

**Criados:**
- `supabase/functions/send-email/index.ts`

**Não tocados:**
- `supabase/functions/send-contact-email/index.ts`
- `src/lib/notifications.ts`
- `src/integrations/supabase/*`
- qualquer outro arquivo

