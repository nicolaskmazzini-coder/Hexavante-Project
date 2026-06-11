# Documentação Hexavante

Índice oficial da documentação do projeto.

> Os arquivos ficam em **`docs/`** (plural). Não existe pasta `doc/` na raiz do repositório.

---

## Comece aqui (desenvolvedores)

| Documento | Conteúdo |
|-----------|----------|
| **[instalacao-e-desenvolvimento.md](instalacao-e-desenvolvimento.md)** | Setup local, `.env`, Prisma, migrations, troubleshooting |
| [stack.md](stack.md) | Arquitetura, tecnologias e convenções de código |
| [der-logico.md](der-logico.md) | **DER oficial** — espelho do `prisma/schema.prisma` |

---

## Produto

| Documento | Conteúdo |
|-----------|----------|
| [visão-geral.md](visão-geral.md) | Descrição, produtos, público-alvo |
| [escopo-mvp.md](escopo-mvp.md) | **Escopo oficial do TCC** (priorização P0–P3) |
| [categorias.md](categorias.md) | Categorias iniciais de cursos |
| [monetizacao.md](monetizacao.md) | Modelo de negócio |
| [publicacao-cursos.md](publicacao-cursos.md) | Fluxo de instrutores, moderação e capa |

---

## Requisitos e regras

| Documento | Conteúdo |
|-----------|----------|
| [requisitos-funcionais.md](requisitos-funcionais.md) | RF001–RF047 + extensões implementadas |
| [casos-de-uso.md](casos-de-uso.md) | UC001–UC071 — fluxos por ator, RF/RN e rotas |
| [regras-de-negocio.md](regras-de-negocio.md) | RN001–RN037 |
| [permissoes.md](permissoes.md) | Papéis, RBAC e matriz de acesso |

---

## Técnico

| Documento | Conteúdo |
|-----------|----------|
| [stack.md](stack.md) | Stack e arquitetura |
| [der-conceitual.md](der-conceitual.md) | Modelo conceitual (visão macro) |
| [der-logico.md](der-logico.md) | DER relacional detalhado |
| [glossario.md](glossario.md) | Nomenclaturas, enums e status |
| [deploy-producao.md](deploy-producao.md) | Deploy com domínio e Docker |

---

## Arquivo

| Pasta | Conteúdo |
|-------|----------|
| [archive/](archive/) | Histórico de decisões (referência) |

---

## Manutenção da documentação

Ao implementar uma feature que altere modelo, API ou fluxo de usuário:

1. Atualize `prisma/schema.prisma` e [der-logico.md](der-logico.md).
2. Documente scripts SQL novos em [instalacao-e-desenvolvimento.md](instalacao-e-desenvolvimento.md).
3. Ajuste [stack.md](stack.md) se mudar arquitetura ou dependências.
4. Registre requisitos novos em [requisitos-funcionais.md](requisitos-funcionais.md) e o fluxo em [casos-de-uso.md](casos-de-uso.md) quando aplicável.
