## Objetivo
Incluir uma coluna CPF na exportação CSV de praticantes feita pela área da escola (`/painel/praticantes`).

## Onde
`src/pages/panel/Praticantes.tsx`, função `handleExportCsv` (linhas 98-111).

## Mudança
Adicionar `"CPF"` ao array de `headers` e `a.cpf ?? ''` à linha correspondente em `rows`, mantendo o CPF sem máscara (valor real do banco, formato cru).

Posição sugerida: logo após "FP ID", para agrupar com os outros identificadores. Resultado dos headers:

```
[Nome, Sobrenome, Arte marcial, Última faixa, FP ID, CPF, Data nasc., Sexo]
```

Nenhum outro arquivo será alterado. O dado `cpf` já vem no objeto `a` (vide `practitioners.cpf` no schema e uso em outras telas).
