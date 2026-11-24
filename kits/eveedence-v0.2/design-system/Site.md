# Site

Arquitetura e blueprint das páginas. A implementação usa `SiteHome`, `SolutionDetail` e `AssuranceFirmsPage` em `components/site.tsx`, e `ProofTest` em `components/proof-test.tsx`. `copy.ts` reúne mensagem principal, CTA e aviso de privacidade; `components/site-content.ts` reúne conteúdo estruturado dos exemplos e soluções; a copy específica das seções e da ficha também mora nos respectivos componentes. `guide.tsx` apresenta o catálogo e incorpora a home real. `components.tsx` é um re-export de compatibilidade.

## Mapa conceitual (não equivale às rotas implementadas)

```text
Home
Soluções ▾
   Incident Evidence · Decision Evidence · Assurance Evidence
Para firmas de asseguração
Como funciona
Recursos ▾
   Evidence Jobs · Pesquisa · Guias · Casos
Abordagem técnica
Empresa
[Teste seu Custo da Prova]
```

Começar pequeno: o objetivo é o visitante entender a tese, não ter 40 páginas. Regulador **nunca** é item de menu. Dentro de uma solução, o regulador vira “Contexto aplicável” (ANPD, BCB, Anatel, ECA Digital) e o Evidence Job continua sendo a unidade de investigação. As páginas de solução usam `SolutionDetail`, `PageHero` e componentes compartilhados; a home utiliza `Hero` e `CaseThread`. As rotas efetivas estão listadas no README do kit.

## Home: ordem das seções

| # | Seção | Componente | Pergunta que responde | Tom da superfície |
|---|---|---|---|---|
| 0 | Cabeçalho | `SiteHeader` | Onde estou? | `surface-app` |
| 1 | Hero | `Hero` + `CaseThread` | Isso é para mim? | `surface-app` |
| 2 | O problema | `Section` + `EvidenceScatter` | “Somos nós.” | `surface-subtle` |
| 3 | Um caso, uma pergunta | `Section` + `QATable` | Como seria a resposta? | `surface-app` |
| 4 | Como funciona | `Section` + `HowSteps` + `Callout` | Preciso trocar de ferramenta? | `surface-subtle` |
| 5 | Soluções | `Section` + `SolutionCard` ×3 | Por onde começo? | `surface-app` |
| 6 | O que não somos | `Section` + `NotCard` ×4 | Quais promessas vocês não fazem? | `surface-subtle` |
| 7 | Teste do Custo da Prova | `ProofTeaser` | Quanto me custa hoje? | `surface-inverse` |
| 8 | Abordagem técnica | `TechNote` | Posso confiar nessa prova? | `surface-subtle` |
| 9 | Rodapé | `SiteFooter` | | `surface-inverse` |

Depois do hero, mostrar um **caso**, não features: não “Evidence Graph / Cryptographic Verification / Policy Engine”. O visitante pensa “somos nós” no bloco 2, “é assim que eu responderia” no 3 e só então lê o método.

## Teste do Custo da Prova (`ProofTest`)

O CTA conduz à ficha exploratória, sem prometer uma demo operacional ou diagnóstico contratado. O visitante escolhe uma decisão ou incidente **encerrado há pelo menos 90 dias** e responde sete perguntas: pessoas, sistemas, política vigente exata, artifacts de origem desconhecida, “não existia” × “não encontramos”, tempo, repetibilidade por um terceiro.

- O resultado é uma **ficha**, não uma nota: sistemas envolvidos, pessoas necessárias, proveniência desconhecida, version binding (completo, parcial, ausente), tempo estimado, repetível por terceiro. “Insumos de reconstrução” = pessoas + sistemas, e o rodapé da ficha diz isso. Sem pontuação, sem faixa, sem “risco alto”.
- Lacunas aparecem como lista do que a equipe teria de resolver à mão (`ev-sheet__open`), nunca como veredito.
- Hoje o componente **não envia nem armazena as respostas pelo site**: elas ficam no estado da página. A ação explícita Copiar ficha grava uma cópia na área de transferência do dispositivo, que pode permanecer após recarregar. Se o comportamento mudar, atualizar o aviso de privacidade em `copy.ts` **no mesmo commit**.
- Fecha com uma ficha local. Não implica disponibilidade de um serviço contratado.

## Regras de página

- Um `t-site-display` por página (só home); demais páginas abrem com `t-site-h2`.
- Um CTA primário (`Button` primary, `lg`) por viewport. Secundário só `secondary`. Nunca dois botões escuros lado a lado.
- Cada exemplo de caso leva `Exemplo ilustrativo`. Cada caso mostra **ao menos uma lacuna** (`StateBadge state="insufficient"`): caso sem lacuna parece score disfarçado.
- Hover nunca é a única via de uma ação; alvo de 44 px; foco visível.
- Layout responsivo abaixo de 880 px: grades viram coluna, menu colapsa (`menu` já está em `Icon`), `t-site-display` cai para 40 px.
- Imagens: nenhuma fotografia, nenhuma ilustração figurativa. Diagrama e caso são o visual.

## Afirmações a validar antes de publicar

A categoria institucional é Governança e Asseguração de IA; a promessa é uma direção de produto. O site apresenta exemplos e hipóteses de valor. Toda afirmação de capacidade precisa de evidência antes da publicação:

1. “A Eveedence **se conecta** às fontes onde o trabalho já acontece” (passo 1 de Como funciona): hoje é verdade para quais conectores?
2. Expediente reconstruível e avaliável: apresentar como exemplo ou objetivo até existir evidência de entrega; não anunciar diagnóstico pago.
3. “Casos que sua equipe consegue **verificar**”: verificar o quê, por quem, com qual ferramenta? Manter alinhado ao Verified-vs-Present do produto.
4. Cadeia de evidência no hero: dados são fictícios e rotulados; garantir que nenhum nome de ferramenta real (Splunk, ServiceNow…) apareça sem acordo.
5. Especificação técnica: em desenvolvimento; não anunciar nome público novo, padrão congelado ou interoperabilidade independente não demonstrada.
6. “Para firmas de asseguração”: apresentar necessidades e hipóteses de valor, sem afirmar redução comprovada de custo, oferta ou parceria disponível.
