# Hexavante

Plataforma educacional multiplataforma para estudantes (ENEM, vestibular, TI) e instituições de ensino (HexaSchools).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | MariaDB |
| ORM | Prisma |
| Autenticação | Auth.js (NextAuth v5) |
| Estilização | Tailwind CSS + shadcn/ui |
| Validação | Zod |
| Hospedagem de vídeos | Externa (YouTube, Vimeo) |

Documentação completa da stack em [docs/stack.md](docs/stack.md).

## Estrutura do projeto

```
hexavante/
├── docs/                  # Documentação do projeto
├── prisma/                # Schema e migrations do banco
├── public/                # Arquivos estáticos
└── src/
    ├── app/               # Rotas e páginas (App Router)
    │   ├── (auth)/        # Login, cadastro, recuperação
    │   ├── (student)/     # Área do estudante
    │   ├── (instructor)/  # Área do instrutor
    │   ├── (admin)/       # Moderação e administração
    │   ├── (schools)/     # HexaSchools (institucional)
    │   └── api/           # Route Handlers
    ├── components/        # Componentes React
    │   └── ui/            # Componentes base (shadcn)
    ├── lib/               # Utilitários, Prisma client, auth config
    ├── services/          # Regras de negócio e acesso a dados
    ├── types/             # Tipos TypeScript compartilhados
    └── hooks/             # React hooks customizados
```

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [Visão geral](docs/visão-geral.md) | Produto, público-alvo e diferenciais |
| [Escopo MVP](docs/escopo-mvp.md) | O que será desenvolvido no TCC (priorizado) |
| [Requisitos funcionais](docs/requisitos-funcionais.md) | RF001–RF043 |
| [Regras de negócio](docs/regras-de-negocio.md) | RN001–RN037 |
| [Permissões](docs/permissoes.md) | Papéis e RBAC |
| [DER lógico](docs/der-logico.md) | Modelo de dados oficial |
| [Stack](docs/stack.md) | Decisões técnicas |

## Pré-requisitos

- Node.js 20+
- MariaDB 10.6+ (ou MySQL 8+)
- npm ou pnpm

## Como rodar

### 1. Banco de dados (MariaDB)

Configure a `DATABASE_URL` no `.env`:

```env
DATABASE_URL="mysql://root:SUA_SENHA@IP_DO_SERVIDOR:3306/hexavante"
```

O banco `hexavante` deve existir no servidor (crie pelo DBeaver se necessário).

### 2. Aplicação

```bash
npm install
cp .env.example .env    # Windows: copy .env.example .env

npx prisma db push      # cria tabelas
npm run db:seed         # cria papéis (USER, INSTRUCTOR...)

npm run dev             # http://localhost:3000
```

### Erro `EPERM` no `prisma generate` (Windows)

Esse erro acontece quando o **servidor dev está rodando** — o Node trava o arquivo `query_engine-windows.dll.node`.

**Solução:**

```powershell
# 1. Pare o npm run dev (Ctrl+C no terminal dele)
# 2. Depois rode:
npx prisma generate
npm run dev
```

Se ainda falhar com `EPERM`:

```powershell
# Mate o processo na porta 3000 e limpe o cache do client
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { taskkill /PID $_.OwningProcess /F }
Remove-Item -Recurse -Force node_modules\.prisma\client
npx prisma generate
npm run dev
```

Se ainda falhar, feche o Prisma Studio (`db:studio`) e tente de novo.

### Contas demo

| Papel | E-mail | Senha |
|-------|--------|-------|
| Instrutor | `instrutor@hexavante.com` | `Instrutor123!` |
| Moderador | `moderador@hexavante.com` | `Moderador123!` |
| Diretor (HexaSchools) | `diretor@hexavante.com` | `Diretor123!` |
| Aluno (HexaSchools) | `aluno@hexavante.com` | `Aluno123!` |

### Rotas disponíveis

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/courses` | Catálogo de cursos (apenas aprovados) |
| `/courses/[slug]` | Detalhe + matrícula |
| `/courses/[slug]/learn` | Área de estudo |
| `/simulados` | Lista de simulados |
| `/simulados/historico` | Histórico e estatísticas |
| `/instructor/apply` | Solicitar perfil de instrutor |
| `/instructor/courses` | Meus cursos (instrutor) |
| `/moderacao` | Dashboard de moderação |
| `/moderacao/instrutores` | Aprovar solicitações de instrutor |
| `/moderacao/cursos` | Cursos pendentes de análise |
| `/perfil` | Perfil com XP, nível e histórico |
| `/ranking` | Ranking de estudantes por XP |
| `/schools` | HexaSchools — instituições |
| `/schools/new` | Criar instituição |
| `/schools/[id]` | Painel da instituição |
| `/schools/[id]/members` | Gerenciar membros |
| `/schools/[id]/courses` | Cursos institucionais |
| `/register` | Cadastro |
| `/login` | Login |

### Gamificação (XP)

| Ação | XP |
|------|-----|
| Concluir aula | 10 |
| Concluir módulo | 25 (bônus) |
| Concluir curso | 100 (bônus) |
| Finalizar simulado | 20 |
| Aprovar simulado (≥ 70%) | +30 (bônus) |

Nível sobe conforme XP acumulado (100 × nível atual para subir).

- **Hexavante** — ambiente para estudantes (cursos, simulados, gamificação)
- **HexaSchools** — ambiente SaaS para instituições de ensino
