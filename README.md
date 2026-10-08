# Eveedence Design System

O kit atual está em [kits/eveedence-v0.2](kits/eveedence-v0.2). Ele contém tokens, componentes React, catálogo e a aplicação no site, com apenas o logotipo atualizado.

## Executar o catálogo

```sh
cd kits/eveedence-v0.2
pnpm install --frozen-lockfile
node design-system/generate-tokens.mjs
pnpm exec tsc --noEmit
pnpm build
pnpm start --hostname 127.0.0.1 --port 3107
```

Abra `http://127.0.0.1:3107/design-system`.

- [Regras e API](kits/eveedence-v0.2/design-system/README.md)
- [Revisão de publicação e origem dos ativos](kits/eveedence-v0.2/design-system/PUBLICATION-REVIEW.md)
- [Site consumidor](https://github.com/eveedence/strathon-site)

O kit é uma reconstrução editável das capturas fornecidas, sem garantia de compatibilidade com todos os componentes do artefato anterior. Tema escuro permanece proposta; a home e a ficha usam tema claro. Exemplos são ilustrativos. Não implementa envio de respostas ou verificação de documentos.

Os pacotes anteriores em `packages/design-system` foram preservados. A adoção do novo kit pelos outros consumidores continua pendente.

Não foi atribuída uma nova licença ao código nem uma autorização de uso da marca. As fontes Geist acompanham a licença OFL no próprio kit; dependências mantêm suas licenças.
