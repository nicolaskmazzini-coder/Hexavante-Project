# Glossário de Nomenclaturas

Evita ambiguidade entre documentação e código.

| Termo no código | Significado | Não confundir com |
|-----------------|-------------|-------------------|
| `CourseModeration` | Análise do moderador para publicar curso | Avaliação do aluno |
| `CourseRating` | Avaliação do aluno (nota, comentário) | Moderação |
| `CourseEnrollment` | Inscrição do aluno em curso (Hexavante) | Matrícula institucional |
| `SchoolEnrollment` | Matrícula do aluno em turma (HexaSchools) | Inscrição em curso |
| `InstructorApplication` | Solicitação para virar instrutor | — |
| `Course` | Curso da plataforma Hexavante | `SchoolCourse` |
| `SchoolCourse` | Curso institucional do HexaSchools | `Course` |

## Status de curso (moderação)

| Status | Descrição |
|--------|-----------|
| `PENDING_REVIEW` | Aguardando análise do moderador |
| `APPROVED` | Aprovado e publicável |
| `REJECTED` | Rejeitado |
| `REVISION_REQUIRED` | Devolvido para correção |

## Status de solicitação de instrutor

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando análise |
| `APPROVED` | Instrutor aprovado |
| `REJECTED` | Solicitação negada |
