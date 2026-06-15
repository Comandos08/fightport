## Diagnóstico confirmado

A edge function `mercadopago-webhook` rejeitou **2 notificações hoje (15/06 às 13:40:32 e 13:40:48)** com `Invalid webhook signature — rejecting request` e nenhuma `credit_transactions` do tipo `purchase` foi gravada. O bônus de 10 créditos às 13:47 foi um contorno manual ("Cortesia administrativa").

**Causa raiz:** `verifyMPSignature` lê `data.id` do **corpo JSON**, mas o MercadoPago assina usando o **`data.id` que vem no query string da URL** de notificação (preservando exatamente o casing/formato original). Quando o body normaliza esse valor (número virando string via `.toString()`), o HMAC nunca bate.

Referência do pagamento informada: **B32WM7KDQYWX4YPSF** (essa string é o "código de referência" exibido ao cliente — preciso convertê-la no `payment.id` numérico via API do MP, o que a função de replay faz automaticamente buscando pelo `external_reference` ou nos pagamentos recentes da conta).

## Plano de execução

### Etapa 1 — Corrigir o webhook (`supabase/functions/mercadopago-webhook/index.ts`)

Reescrever `verifyMPSignature`:

```ts
const url = new URL(req.url);
const dataIdFromUrl = url.searchParams.get("data.id") ?? url.searchParams.get("id");
let dataIdFromBody: string | null = null;
try { dataIdFromBody = JSON.parse(body)?.data?.id?.toString() ?? null; } catch {}
const dataId = dataIdFromUrl ?? dataIdFromBody;
const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
```

Comparação **timing-safe** (XOR char-a-char) substituindo `computed === v1`. Em falha, logar `xRequestId`, `dataId` e qual fonte foi usada (sem expor o secret).

### Etapa 2 — Criar log persistente de webhooks (migração)

Tabela `public.mp_webhook_events` para registrar **toda** notificação recebida (válida ou não), com `payment_id`, `signature_valid`, `processed`, `error`, headers e body. RLS: somente admin lê. Esse log elimina o ponto cego atual.

### Etapa 3 — Edge function de replay (`supabase/functions/mp-replay-payment/index.ts`)

Função admin-only que recebe um `payment_id` numérico **ou** uma `external_reference` **ou** uma referência tipo "B32WM7KDQYWX4YPSF" (busca via `GET /v1/payments/search?external_reference=...` na API do MP), e executa o mesmo fluxo do webhook (idempotente via `payment_id`). Usada para:
- Reprocessar o pagamento perdido de hoje;
- Resolver qualquer falha futura sem editar dados na mão.

### Etapa 4 — Reprocessar o pagamento de hoje

1. Chamar `mp-replay-payment` com a referência **B32WM7KDQYWX4YPSF**.
2. Validar que a `credit_transactions` (`type=purchase, status=completed`) foi criada e o saldo da escola aumentou.
3. Reverter o bônus manual: inserir `credit_transactions` (`type=bonus, amount=-10`, com `package_name='Estorno cortesia 15/06'`) e chamar `add_credits(school_id, -10)` para zerar o duplo crédito. Deixar o registro original visível no histórico para auditoria.

### Etapa 5 — Botão "Reprocessar pagamento" no painel admin

Em `/dash/financeiro`, adicionar um pequeno card "Reprocessar pagamento MercadoPago" com input para `payment_id` / `external_reference` / referência curta e botão que chama `mp-replay-payment`. Feedback de sucesso/erro via toast.

### Etapa 6 — Alerta proativo

No webhook, quando `signature_valid = false`, criar uma `notifications` para o admin (`type=webhook_signature_invalid`) e enviar e-mail via Resend. Assim, da próxima vez você descobre em segundos, não horas.

### Etapa 7 — Teste automatizado

`supabase/functions/mercadopago-webhook/index.test.ts` cobrindo: assinatura válida (com `data.id` da URL), assinatura inválida, payload duplicado (idempotência), pagamento não-aprovado.

## Detalhes técnicos

**DDL da tabela de log:**

```sql
CREATE TABLE public.mp_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text,
  signature_valid boolean NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  error text,
  headers jsonb,
  body jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mp_webhook_events TO authenticated;
GRANT ALL ON public.mp_webhook_events TO service_role;
ALTER TABLE public.mp_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin reads webhook log" ON public.mp_webhook_events
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX ON public.mp_webhook_events (created_at DESC);
CREATE INDEX ON public.mp_webhook_events (payment_id);
```

**Por que reprocessar é seguro:** o webhook já verifica duplicidade por `payment_id` (`select` antes do insert + tratamento do erro `23505` da constraint única). Chamar `mp-replay-payment` 10 vezes resulta em **um único** crédito.

**Por que a correção do `data.id` resolve definitivamente:** é o algoritmo oficial documentado pelo MercadoPago. A nossa leitura do body funcionava por acidente em testes com `id` numérico curto; em produção o MP varia o formato entre eventos.

## Ordem de execução

1. Etapas 1 + 2 + 3 + 7 em paralelo (código).
2. Deploy das edge functions.
3. Etapa 4 (reprocessar B32WM7KDQYWX4YPSF + reverter bônus).
4. Etapas 5 + 6 (UI e alertas).

Após sua aprovação eu sigo direto.
