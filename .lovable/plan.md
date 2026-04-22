

# Corrigir envio do formulário de contato

Escopo cirúrgico: só `supabase/functions/send-contact-email/index.ts` e `src/pages/Contato.tsx`. Nada mais é tocado.

## O que muda

### 1. `supabase/functions/send-contact-email/index.ts`

Três alterações pontuais, nada mais:

- **Remetente verificado**: `from` passa de `"fightport.pro <onboarding@resend.dev>"` (sandbox do Resend, só entrega pro dono da conta) para `"FightPort <noreply@fightport.pro>"`.
- **Falha do Resend deixa de ser mascarada como sucesso**: o bloco `if (!resendRes.ok)` agora responde com **status 502** (mantendo o body `{ success: false, emailSent: false, dbSaved: !dbError }`), para o frontend tratar como erro real.
- **Catch type-safe**: substituir `error.message` por
  ```ts
  const msg = error instanceof Error ? error.message : String(error);
  ```
  e usar `msg` no JSON de resposta 500.

Tudo o mais (CORS, validação atual, insert no `contact_submissions`, template HTML, headers) fica exatamente como está.

### 2. `src/pages/Contato.tsx`

Substituir **apenas o conteúdo do `try`** dentro de `handleSubmit` por:

```tsx
const { data, error } = await supabase.functions.invoke('send-contact-email', {
  body: { name, email, organization: org, subject, message },
});
if (error) throw error;
if (data && data.emailSent === false) {
  toast.error('Não foi possível enviar sua mensagem agora. Tente novamente em instantes.');
  return;
}
setSubmitted(true);
```

Resto do componente (estilos, JSX, estados, validações, `sending`, `catch`, `finally`) não muda.

## Pré-requisito externo (fora do código)

Para o `from: noreply@fightport.pro` realmente entregar, o domínio `fightport.pro` precisa estar **verificado no Resend** (SPF + DKIM publicados no DNS). Enquanto não estiver verificado, o Resend continuará rejeitando os envios — só que agora você verá o erro de verdade no toast em vez do falso sucesso silencioso.

## Detalhes técnicos

- Status `502 Bad Gateway` é apropriado: a edge function está OK, mas o upstream (Resend) falhou.
- `supabase.functions.invoke` trata respostas non-2xx como erro automaticamente, então o `if (error) throw error` cobre o 502.
- O caminho `data.emailSent === false` cobre o caso (atual no código) em que mesmo um 200 viesse com `emailSent: false` — defesa em profundidade.
- Nenhuma mudança em banco, RLS, secrets, CORS, validação ou tradução.

## Arquivos editados

- `supabase/functions/send-contact-email/index.ts`
- `src/pages/Contato.tsx`

