# Escopo MVP — TCC Hexavante

Documento único e oficial do que será desenvolvido no TCC. Tudo fora desta lista fica em **Fase 2** ou **Fase 3**.

## Objetivo do MVP

Entregar um fluxo completo e demonstrável:

```
Cadastro → Login → Matricular em curso → Assistir aula → Fazer simulado → Ver XP
```

Com moderação de instrutores/cursos e versão básica do HexaSchools.

---

## Priorização

### P0 — Obrigatório (sem isso não há TCC)

| Módulo | Funcionalidades | RF relacionados |
|--------|-----------------|-----------------|
| **Autenticação** | Cadastro, login e-mail/senha, login Google, perfil editável | RF001–RF003, RF006–RF007 |
| **Cursos (core)** | Categorias, cursos, módulos, aulas (vídeo externo), materiais PDF | RF008–RF012, RF013, RF015 |
| **Matrícula** | Inscrição em curso, progresso básico | RF009–RF010 |

**Critério de pronto:** usuário logado navega um curso com módulos/aulas e vê seu progresso.

---

### P1 — Importante (diferencial do projeto)

| Módulo | Funcionalidades | RF relacionados |
|--------|-----------------|-----------------|
| **Simulados** | Questões objetivas, correção automática, histórico de tentativas | RF027–RF030 |
| **Moderação** | Solicitação de instrutor, aprovação de instrutor, aprovação de curso | RN006–RN010 |
| **Instrutor** | Criar/editar curso (status pendente até aprovação) | RF011–RF012 |

**Critério de pronto:** instrutor aprovado cria curso; moderador aprova; aluno faz simulado e vê resultado.

---

### P2 — Desejável (se o tempo permitir)

| Módulo | Funcionalidades | RF relacionados |
|--------|-----------------|-----------------|
| **Gamificação** | XP por ações, moedas, ranking simples | RF035 (parcial) |
| **HexaSchools básico** | Instituição, turmas, professores, alunos, cursos institucionais | RF037–RF040 |
| **Certificados** | Emissão básica com código de verificação | RF031, RN015–RN017 |

**Critério de pronto:** escola cria turma com alunos; aluno ganha XP ao concluir aula.

---

### P3 — Stretch (só se P0–P1 estiverem 100%)

| Item | Motivo do corte |
|------|-----------------|
| Loja de moedas | Complexidade de e-commerce virtual |
| Avaliações de curso (nota + comentário) | Conflita com tempo; Fase 2 |
| Quiz por módulo com moedas | Simplificar para quiz básico ou simulado apenas |
| Perfil especial de instrutor (métricas) | UI extra; dados podem ser mockados |

---

## Fora do MVP (Fase 2 — pós-TCC)

| Funcionalidade | Motivo |
|----------------|--------|
| Marketplace e pagamentos reais | Integração financeira (Stripe, split 85/15) |
| Assinatura Premium funcional | Cobrança recorrente |
| Loja Hexavante completa | Catálogo de itens, compras |
| Aulas ao vivo | WebRTC/infraestrutura |
| Chat em tempo real | WebSocket |
| Download offline | App mobile + sync |
| Planner (metas e tarefas) | RF021–RF026 |
| Notificações push/e-mail | RF034 |
| Login Microsoft | RF004 |
| Redação e IA | Escopo futuro |
| Correção automática de código | Escopo futuro |

## Fora do MVP (Fase 3 — visão longo prazo)

- Aplicativos mobile e desktop nativos
- IA para redação e correção de código
- Analytics avançado
- Sistema financeiro completo (HexaSchools + marketplace)

---

## Visão final do produto (referência)

Para contexto, a visão completa inclui: Hexavante, HexaSchools, marketplace, simulados, redação, aulas ao vivo, loja, XP, moedas, cursos premium, certificados, IA, apps mobile/desktop.

Isso **não** entra no MVP. Está documentado em [visão-geral.md](visão-geral.md).

---

## Ordem sugerida de implementação

```
Sprint 1  → Auth + User/Role (Prisma)
Sprint 2  → Categorias + Cursos + Módulos + Aulas
Sprint 3  → Matrícula + Progresso
Sprint 4  → Simulados + Tentativas
Sprint 5  → Moderação (instrutor + curso)
Sprint 6  → Gamificação (XP básico)
Sprint 7  → HexaSchools básico (se houver tempo)
```

---

## Métricas de sucesso do TCC

1. Demonstração ao vivo do fluxo P0 completo
2. Pelo menos um módulo P1 funcionando (simulados ou moderação)
3. DER implementado no Prisma com migrations
4. Documentação alinhada com o código entregue
