# Eveedence Design System

> **Referência visual vigente: Eveedence Design System v0.2.0.** O material em `packages/design-system/` é legado e não deve ser usado como referência de marca, tokens ou componentes para trabalhos novos.

## Qual versão consultar?

| Fonte | Responsabilidade |
|---|---|
| [Kit v0.2.0 — baseline congelada em 08/10/2026](https://github.com/eveedence/design-system/tree/44d50876edcc04e8b532899f8401f05e05336a4b/kits/eveedence-v0.2) | Contrato visual, logotipo, tokens e componentes |
| [PR #1 — revisão do kit](https://github.com/eveedence/design-system/pull/1) | Acompanhar a revisão e o estado de integração; verificar seu HEAD antes de usar |
| [Documentação do kit na baseline](https://github.com/eveedence/design-system/blob/44d50876edcc04e8b532899f8401f05e05336a4b/kits/eveedence-v0.2/design-system/README.md) | Regras de marca, arquitetura de tokens e API |
| `packages/design-system/` | Histórico preservado; não é o design system vigente |

Em 24/11/2026, o kit encontrava-se na PR #1, ainda não integrada à branch padrão. A presença de material legado na `main` não o torna canônico. Se o diretório do kit não estiver na revisão local, consulte a baseline acima ou a PR para a revisão em andamento.

## Precedência

- Identidade e implementação visual: v0.2, wordmark-only, tokens e componentes versionados.
- Jornadas e telas: pesquisa de UX mantida separadamente; estudos e wireframes não substituem tokens nem o SVG mestre.
- Posicionamento e limites de produto: decisões de estratégia vigentes; o kit não é autoridade sobre prontidão técnica, adoção de mercado ou condições comerciais.
- Mudanças de conteúdo não alteram o contrato visual congelado. Alterações de marca, tokens, contratos de componentes ou semântica de estados exigem decisão explícita de versão.

## Executar o catálogo

Na revisão que contém `kits/eveedence-v0.2/`:

```sh
cd kits/eveedence-v0.2
pnpm install --frozen-lockfile
node design-system/generate-tokens.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm start --hostname 127.0.0.1 --port 3107
```

Abra `http://127.0.0.1:3107/design-system`. O tema escuro permanece proposta do catálogo. Os exemplos são ilustrativos.

## Limites de uso e publicação

O repositório é público. Acesso a arquivos, freeze visual, CI verde e merge são fatos distintos de licença de redistribuição, autorização de uso da marca e publicação do site. Não foi atribuída uma nova licença geral ao kit; as fontes Geist incluem sua licença OFL. Consulte a revisão de publicação na versão utilizada. Não se infere licença do kit a partir dos metadados do legado.

O kit não comprova prontidão de produto, operação de conectores, certificação ou suficiência de evidências. A adoção pelos consumidores e a publicação do site são decisões separadas.
