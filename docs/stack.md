# Stack Técnica — Hexavante

## Decisão

Stack escolhida para o MVP do TCC, priorizando produtividade, tipagem forte e alinhamento com o DER documentado.

## Tecnologias

### Next.js 15 (App Router)

- Frontend e backend no mesmo projeto (Route Handlers + Server Actions)
- Renderização híbrida (SSR/SSG) para SEO em páginas públicas de cursos
- Suporte nativo a TypeScript
- Ecossistema maduro para TCC e portfólio

### TypeScript

- Tipagem em toda a aplicação
- Integração com Prisma (tipos gerados automaticamente)
- Menos erros em tempo de execução

### MariaDB + Prisma 6

- MariaDB atende relacionamentos N:N do DER (papéis, instrutores, matrículas)
- Prisma 6 gera migrations a partir do `prisma/schema.prisma`
- Provider no Prisma: `mysql` (compatível com MariaDB)
- Schema espelha o [DER lógico](der-logico.md)
- Subir o banco: `docker compose up -d` ou MariaDB local (XAMPP/Laragon)

### Auth.js (NextAuth v5)

- Login com e-mail/senha
- OAuth Google (requisito do MVP)
- OAuth Microsoft (Fase 2)
- Sessões JWT ou database — database recomendado para RBAC

### Tailwind CSS + shadcn/ui

- UI consistente sem reinventar componentes
- shadcn/ui fornece formulários, dialogs, tabelas prontos
- Responsivo para web (mobile/desktop nativos ficam na Fase 3)

### Zod

- Validação de formulários e APIs
- Schemas compartilhados entre client e server

### Hospedagem de vídeos (externa)

- Aulas armazenam apenas `video_url` e `video_provider`
- Sem upload de vídeo na plataforma (decisão de negócio RN implícita)
- Reduz custo de infraestrutura no TCC

## Arquitetura

```
┌─────────────────────────────────────────┐
│              Browser (React)             │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Next.js App Router               │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │   Pages     │  │  Server Actions  │  │
│  │  (RSC/CSR)  │  │  + Route Handlers│  │
│  └─────────────┘  └────────┬─────────┘  │
└────────────────────────────┼────────────┘
                             │
┌────────────────────────────▼────────────┐
│              services/                   │
│     (regras de negócio, orquestração)    │
└────────────────────────────┬────────────┘
                             │
┌────────────────────────────▼────────────┐
│         Prisma ORM → MariaDB             │
└─────────────────────────────────────────┘
```

## Convenções de código

| Pasta | Responsabilidade |
|-------|------------------|
| `src/app/` | Rotas, layouts, páginas |
| `src/components/` | Componentes de UI reutilizáveis |
| `src/lib/` | Configurações (prisma, auth, utils) |
| `src/services/` | Lógica de negócio (sem JSX) |
| `src/types/` | Tipos e interfaces compartilhados |
| `prisma/` | Schema, seeds, migrations |

## Variáveis de ambiente

```env
DATABASE_URL="mysql://user:pass@localhost:3306/hexavante"
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
```

## O que fica fora do MVP

| Item | Motivo | Fase |
|------|--------|------|
| Redis / filas | Complexidade desnecessária no TCC | Fase 2 |
| WebSocket (chat/ao vivo) | Requisito futuro | Fase 2 |
| App mobile (React Native) | Escopo futuro | Fase 3 |
| Upload de vídeo próprio | Vídeos externos por decisão de negócio | — |
| Pagamentos reais (Stripe) | Marketplace na Fase 2 | Fase 2 |

## Próximo passo de implementação

1. `npm install` + configurar Prisma com schema base (users, roles)
2. Auth.js com cadastro/login/Google
3. CRUD de categorias e cursos
4. Simulados e gamificação conforme [escopo-mvp.md](escopo-mvp.md)
