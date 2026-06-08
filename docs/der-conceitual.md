# DER Conceitual v1 (MVP)

> Nomenclatura oficial: ver [glossario.md](glossario.md)

```
USER
│
├── USER_ROLE → ROLE
├── USER_XP
├── USER_WALLET
├── COURSE_ENROLLMENT
├── EXAM_ATTEMPT
└── CERTIFICATE

CATEGORY
└── COURSE
    ├── COURSE_INSTRUCTOR → USER
    ├── MODULE
    │   ├── LESSON
    │   ├── MATERIAL
    │   └── QUIZ
    │       ├── QUESTION → ALTERNATIVE
    │       └── QUIZ_ATTEMPT
    ├── COURSE_MODERATION    ← moderação (moderador)
    └── CERTIFICATE

EXAM
├── EXAM_QUESTION
└── EXAM_ATTEMPT

SCHOOL
├── SCHOOL_USER
├── SCHOOL_COURSE
├── SCHOOL_CLASS
└── SCHOOL_ENROLLMENT

INSTRUCTOR_APPLICATION
COURSE_MODERATION
```

## Entidades do MVP

| Domínio | Entidades |
|---------|-----------|
| Usuários | User, Role, UserRole, UserXP, UserWallet |
| Cursos | Category, Course, CourseInstructor, Module, Lesson, Material |
| Quiz | Quiz, Question, Alternative, QuizAttempt |
| Simulados | Exam, ExamQuestion, ExamAttempt |
| Matrícula | CourseEnrollment |
| Certificados | Certificate |
| Moderação | InstructorApplication, CourseModeration |
| HexaSchools | School, SchoolUser, SchoolCourse, SchoolClass, SchoolEnrollment |

## Entidades fora do MVP (Fase 2)

Documentadas para evitar retrabalho, **não implementar no TCC inicial**:

| Entidade | Motivo |
|----------|--------|
| CourseRating | Avaliações de alunos (Fase 2) |
| SubscriptionPlan, UserSubscription | Assinatura Premium |
| StoreItem, StorePurchase | Loja de moedas |
| Goal, Task | Planner |
| Notification | Notificações |
| LiveRoom, ChatMessage | Aulas ao vivo e chat |
| InstructorProfile | Perfil estendido do instrutor |
| LessonProgress | Progresso por aula (pode ser campo em enrollment no MVP) |

## Fluxo de moderação

```
Usuário → InstructorApplication → (aprovado) → Instrutor
Instrutor → Course (PENDING_REVIEW) → CourseModeration → (aprovado) → Publicado
```
