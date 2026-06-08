# Publicação de Cursos por Instrutores

## Fluxo oficial (dupla moderação)

```
Usuário
  ↓ solicita instrutor
Moderador analisa (InstructorApplication)
  ↓ aprovado
Instrutor cria curso (status: PENDING_REVIEW)
  ↓
Moderador analisa (CourseModeration)
  ↓ aprovado
Curso publicado
```

## Critérios de análise do moderador

- Conformidade com diretrizes da plataforma
- Qualidade mínima do conteúdo
- Correspondência entre descrição e conteúdo
- Ausência de materiais proibidos ou inadequados

## Resultado da análise

- **Aprovado** — curso publicável
- **Reprovado** — curso não publicado
- **Devolvido para correção** — instrutor ajusta e reenvia

Somente cursos aprovados ficam visíveis aos estudantes.
