<p align="center">
  <img src="https://img.shields.io/badge/HEXAVANTE-Education%20Platform-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="Hexavante" />
</p>

<p align="center">
  <strong>Aprenda, simule e evolua — do ENEM ao código.</strong><br/>
  <em>Learn, practice, and level up — from exams to code.</em>
</p>

<p align="center">
  <a href="#português">🇧🇷 Português</a> · <a href="#english">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MariaDB-11-003545?logo=mariadb&logoColor=white" alt="MariaDB" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Auth.js-v5-000?logo=auth0&logoColor=white" alt="Auth.js" />
</p>

---

<a id="português"></a>

## Português

### Sobre o projeto

**Hexavante** é uma plataforma educacional para estudantes de ensino médio, vestibular, ENEM e TI. Integra cursos com vídeo externo, simulados gamificados, aulas ao vivo, certificados, loja virtual, ranking e comunidade com mensagens privadas.

> A gestão institucional (escolas e turmas) está no projeto separado **[HexaSchools](../hexaschools)**.

### Principais features

| Módulo | O que oferece |
|--------|----------------|
| **Cursos** | Catálogo moderado, módulos, aulas em vídeo (YouTube/Vimeo), progresso e materiais |
| **Simulados** | Múltipla escolha e dissertativas, cronômetro, imagens no enunciado, recompensas diárias de XP |
| **Gamificação** | XP, níveis, moedas, boosters temporários e multiplicadores |
| **Aulas ao vivo** | Salas com chat público para transmissões |
| **Ranking** | Classificação de estudantes por XP |
| **Certificados** | Emissão e verificação por código |
| **Loja** | Títulos, cosméticos, boosters, passes e pacotes de revisão |
| **Comunidade** | Feed social, seguidores, curtidas e **mensagens privadas** |
| **Moderação** | Aprovação de instrutores/cursos, correção de dissertativas, painel admin |

### Screenshots

> 📸 **Placeholder** — insira aqui capturas ou GIFs do projeto em funcionamento.

| Tela | Arquivo sugerido |
|------|------------------|
| Home | `docs/assets/screenshots/home.png` |
| Catálogo de cursos | `docs/assets/screenshots/courses.png` |
| Simulado em andamento | `docs/assets/screenshots/exam.png` |
| Ranking / Perfil | `docs/assets/screenshots/profile.png` |
| Loja / Mensagens | `docs/assets/screenshots/shop-messages.png` |

```markdown
<!-- Exemplo de inclusão após adicionar as imagens -->
<p align="center">
  <img src="docs/assets/screenshots/home.png" width="720" alt="Home Hexavante" />
</p>
```

### Pré-requisitos

- **Node.js** 20 LTS
- **MariaDB** 10.6+ (ou MySQL 8+)
- **npm** 10+
- **Git**

### Como rodar

#### Windows (PowerShell)

```powershell
# 1. Clonar e instalar
git clone <url-do-repositorio> hexavante
cd hexavante
npm install

# 2. Variáveis de ambiente
copy .env.example .env
# Edite .env: DATABASE_URL, AUTH_SECRET, AUTH_URL

# 3. Banco de dados
npx prisma db push
npx prisma generate
npm run db:seed

# 4. Scripts incrementais (se o banco já existia)
npm run db:features
npm run db:economy
npm run db:social
npm run db:shop-expand
npm run db:direct-messages

# 5. Iniciar
npm run dev
# → http://localhost:3000
```

<details>
<summary>Erro EPERM no prisma generate (Windows)</summary>

Pare o `npm run dev` antes de regenerar o client:

```powershell
npx prisma generate
npm run dev
```

Se persistir:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Remove-Item -Recurse -Force node_modules\.prisma\client -ErrorAction SilentlyContinue
npx prisma generate
```

</details>

#### Linux / macOS

```bash
# 1. Clonar e instalar
git clone <url-do-repositorio> hexavante
cd hexavante
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# Edite .env: DATABASE_URL, AUTH_SECRET, AUTH_URL

# 3. Criar database (se necessário)
mysql -u root -p -e "CREATE DATABASE hexavante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Sincronizar schema
npx prisma db push
npx prisma generate
npm run db:seed

# 5. Scripts incrementais (ambiente existente)
npm run db:features && npm run db:economy && npm run db:social
npm run db:shop-expand && npm run db:direct-messages

# 6. Iniciar
npm run dev
# → http://localhost:3000
```

Guia completo: [docs/instalacao-e-desenvolvimento.md](docs/instalacao-e-desenvolvimento.md) · Deploy: [docs/deploy-producao.md](docs/deploy-producao.md)

### Contas demo

| Papel | E-mail | Senha |
|-------|--------|-------|
| Aluno | `aluno@hexavante.com` | `Aluno123!` |
| Instrutor | `instrutor@hexavante.com` | `Instrutor123!` |
| Moderador | `moderador@hexavante.com` | `Moderador123!` |
| Admin | `admin@hexavante.com` | `Admin123!` |

### Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/courses` | Catálogo de cursos |
| `/simulados` | Lista de simulados |
| `/shop` | Loja (moedas, cosméticos, boosters) |
| `/social` | Feed da comunidade |
| `/mensagens` | Mensagens privadas |
| `/ranking` | Ranking por XP |
| `/certificados` | Certificados emitidos |
| `/live-rooms` | Aulas ao vivo |
| `/perfil/[username]` | Perfil público |
| `/moderacao` | Painel de moderação |

### Estrutura do projeto

```
hexavante/
├── docs/                  # Documentação
├── prisma/                # Schema, seeds e SQL incremental
├── public/                # Estáticos e uploads
├── deploy/                # Nginx e configs de produção
└── src/
    ├── app/               # App Router (páginas + API)
    ├── components/        # UI React
    ├── services/          # Regras de negócio
    ├── lib/               # Auth, Prisma, validações
    └── hooks/             # Hooks client-side
```

### Documentação

Índice completo: **[docs/README.md](docs/README.md)**

| Documento | Conteúdo |
|-----------|----------|
| [Visão geral](docs/visão-geral.md) | Produto e público-alvo |
| [Escopo MVP](docs/escopo-mvp.md) | Priorização do TCC |
| [Stack](docs/stack.md) | Arquitetura técnica |
| [DER lógico](docs/der-logico.md) | Modelo de dados |
| [Instalação](docs/instalacao-e-desenvolvimento.md) | Setup e troubleshooting |
| [Deploy](docs/deploy-producao.md) | Docker, Nginx, Cloudflare |

### Roadmap

| Fase | Status | Itens |
|------|--------|-------|
| **MVP (TCC)** | ✅ Entregue | Auth, cursos, simulados, moderação, XP, certificados |
| **Pós-MVP** | 🚧 Em evolução | Loja expandida, social, DMs, recompensas diárias, premium trial |
| **Fase 2** | 📋 Planejado | Pagamentos reais, WebSocket, planner, avaliações de curso |
| **Fase 3** | 📋 Planejado | Apps mobile, IA para redação, analytics avançado |

### Contribuição

1. Faça fork e crie uma branch (`feat/minha-feature`).
2. Siga as convenções em [docs/stack.md](docs/stack.md).
3. Atualize `docs/` se alterar modelo, API ou fluxo.
4. Rode `npm run build` e `npm test` antes do PR.
5. Descreva migrations SQL necessárias na descrição do PR.

### Licença

Projeto acadêmico (TCC) — **todos os direitos reservados** aos autores. Uso, redistribuição ou deploy comercial requer autorização explícita. Para licenciamento aberto (ex.: MIT), consulte os mantenedores.

---

<a id="english"></a>

## English

### About

**Hexavante** is an educational platform for high-school students, university entrance exams (ENEM), and IT learners. It combines video-based courses, gamified practice exams, live classes, certificates, an in-app shop, leaderboards, and a community with private messaging.

> Institutional management (schools and classes) lives in the separate **[HexaSchools](../hexaschools)** project.

### Key features

| Module | What it offers |
|--------|----------------|
| **Courses** | Moderated catalog, modules, external video lessons, progress tracking |
| **Practice exams** | Multiple choice & essays, timer, question images, daily XP rewards |
| **Gamification** | XP, levels, coins, temporary boosters and multipliers |
| **Live classes** | Rooms with public chat during streams |
| **Leaderboard** | Student ranking by XP |
| **Certificates** | Issuance and code-based verification |
| **Shop** | Titles, cosmetics, boosters, passes, review packs |
| **Community** | Activity feed, follows, likes, and **private DMs** |
| **Moderation** | Instructor/course approval, essay grading, admin panel |

### Screenshots

> 📸 **Placeholder** — add screenshots or GIFs here once available (see PT section for suggested paths).

### Prerequisites

- **Node.js** 20 LTS
- **MariaDB** 10.6+ (or MySQL 8+)
- **npm** 10+
- **Git**

### Quick start

#### Windows (PowerShell)

```powershell
git clone <repository-url> hexavante
cd hexavante
npm install
copy .env.example .env
npx prisma db push
npx prisma generate
npm run db:seed
npm run dev
```

#### Linux / macOS

```bash
git clone <repository-url> hexavante
cd hexavante
npm install
cp .env.example .env
npx prisma db push
npx prisma generate
npm run db:seed
npm run dev
```

Full guide: [docs/instalacao-e-desenvolvimento.md](docs/instalacao-e-desenvolvimento.md) · Production: [docs/deploy-producao.md](docs/deploy-producao.md)

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Student | `aluno@hexavante.com` | `Aluno123!` |
| Instructor | `instrutor@hexavante.com` | `Instrutor123!` |
| Moderator | `moderador@hexavante.com` | `Moderador123!` |
| Admin | `admin@hexavante.com` | `Admin123!` |

### Main routes

| Route | Description |
|-------|-------------|
| `/courses` | Course catalog |
| `/simulados` | Practice exams |
| `/shop` | In-app shop |
| `/social` | Community feed |
| `/mensagens` | Private messages |
| `/ranking` | XP leaderboard |
| `/certificados` | Certificates |
| `/live-rooms` | Live classes |
| `/moderacao` | Moderation dashboard |

### Documentation

Full index: **[docs/README.md](docs/README.md)**

### Roadmap

| Phase | Status | Items |
|-------|--------|-------|
| **MVP (thesis)** | ✅ Shipped | Auth, courses, exams, moderation, XP, certificates |
| **Post-MVP** | 🚧 Active | Expanded shop, social, DMs, daily rewards, premium trial |
| **Phase 2** | 📋 Planned | Real payments, WebSocket, study planner, course reviews |
| **Phase 3** | 📋 Planned | Mobile apps, AI essay feedback, advanced analytics |

### Contributing

1. Fork and branch from `main`.
2. Follow [docs/stack.md](docs/stack.md).
3. Update `docs/` when behavior or schema changes.
4. Run `npm run build` and `npm test` before opening a PR.

### License

Academic thesis project — **all rights reserved**. Commercial use or redistribution requires explicit permission from the authors.

---

<p align="center">
  <sub>Hexavante · Built with Next.js, Prisma & MariaDB</sub>
</p>
