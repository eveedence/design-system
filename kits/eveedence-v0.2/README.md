# Eveedence — site e design system

Referência visual v0.2.0 congelada em 08/10/2026: implementação local do site e do catálogo com o logotipo oficial atualizado. Usa apenas o wordmark, sem símbolo ou tagline. Os pacotes legados não são fonte canônica; pesquisa de UX e estratégia vigentes orientam fluxos e conteúdo sem alterar este contrato visual.

## Desenvolvimento

Requer Node.js 22 e pnpm.

```sh
pnpm install --frozen-lockfile
node design-system/generate-tokens.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm start --hostname 127.0.0.1 --port 3107
```

- `/`: home.
- `/design-system`: tokens, tipografia, temas e componentes.
- `/custo-da-prova`: ficha local, sem score, envio ou persistência de respostas.

[Documentação do kit](design-system/README.md). [Repositório do design system](https://github.com/eveedence/design-system).

## Escopo

Reconstrução editável das capturas fornecidas, com exemplos ilustrativos e lacunas explícitas. Não equivale aos 22 componentes do artefato anterior. Tema escuro é proposta do catálogo. Não afirma conectores operacionais, conformidade, certificação ou verificação completa de casos. A sincronização do código não significa publicação em produção.

O SVG oficial foi preservado. As fontes Geist são distribuídas com sua licença OFL em `public/brand/fonts/OFL.txt`. Os ativos de marca não recebem licença de uso pelo simples acesso a este repositório. Não foi escolhida uma nova licença para o código.

O relatório de contraste versionado está em `design-system/contrast-report.json`; os relatórios de navegador são gerados na validação e disponibilizados como artifacts de CI. A checagem de tokens cobre pares específicos e não constitui auditoria WCAG completa.
