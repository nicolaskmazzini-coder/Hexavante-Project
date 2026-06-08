# Papéis e Permissões

## Hexavante (plataforma)

| Papel | Descrição |
|-------|-----------|
| **USER** | Estudante padrão |
| **INSTRUCTOR** | Cria cursos (após aprovação) |
| **MODERATOR** | Aprova instrutores e cursos |
| **ADMIN** | Administração geral da plataforma |

Um usuário pode ter **múltiplos papéis** simultaneamente (RBAC N:N via `user_roles`).

## HexaSchools (institucional)

Hierarquia:

```
Diretor
 └── Administrador
      └── Coordenador
           ├── Professor
           └── Aluno
```

### Diretor

Responsável máximo pela instituição.

- Gerenciar assinatura da plataforma
- Adicionar e remover administradores
- Visualizar todos os dados institucionais
- Gerenciar cursos, turmas, professores e alunos
- Emitir certificados

### Administrador Institucional

Administração operacional (sem acesso à assinatura).

- Gerenciar cursos, turmas, professores e alunos
- Emitir certificados
- Adicionar coordenadores
- Gerenciar configurações institucionais

### Coordenador

Coordenação acadêmica.

- Criar e editar cursos institucionais
- Criar turmas
- Gerenciar professores
- Emitir certificados
- Acompanhar atividades acadêmicas

### Professor

Conteúdo acadêmico (não cria o curso — o coordenador cria).

- Criar e editar aulas
- Aplicar simulados
- Gerenciar conteúdos de suas turmas

### Aluno

- Participar de cursos e aulas
- Realizar simulados
- Visualizar certificados

## Regras de relacionamento

- Um aluno pode estar matriculado em **vários cursos** institucionais ao mesmo tempo
- Um professor pode atuar em **várias turmas** simultaneamente
- Coordenador cria o curso; professor produz as aulas (Opção B do modelo institucional)
