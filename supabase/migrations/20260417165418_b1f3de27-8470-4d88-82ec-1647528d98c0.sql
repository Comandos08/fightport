-- Hotfix Migration 4 — Fazer head_coaches_public funcionar para anon
-- Problema: a view foi criada com security_invoker=true, então herda a RLS
-- da tabela base head_coaches (que agora é apenas para a escola dona).
-- Resultado: anon consulta a view e recebe 0 linhas, quebrando o passaporte público.
--
-- Solução: trocar para security_invoker=false (modo definer). A view executa
-- com permissões do dono (postgres), bypassa a RLS da tabela base, mas
-- expõe APENAS as 4 colunas selecionadas (id, school_id, name, graduation).
-- Não há colunas sensíveis em head_coaches além das já expostas, então
-- isso é seguro e equivalente ao comportamento público anterior — só que agora
-- limitado ao subset de colunas em vez da tabela inteira.

ALTER VIEW public.head_coaches_public SET (security_invoker = false);

-- Reafirmar grant (idempotente)
GRANT SELECT ON public.head_coaches_public TO anon, authenticated;