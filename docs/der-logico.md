# DER Lógico v1 (oficial)

Espelho do schema Prisma. Convenções: PK = Primary Key, FK = Foreign Key.

> **Correção v1.1:** `COURSE_REVIEWS` renomeado para `COURSE_MODERATIONS` (moderação). Avaliações de alunos usam `COURSE_RATINGS` (Fase 2).

---

## Módulo de Usuários

### USERS

```
PK id
username UNIQUE
full_name
email UNIQUE
password_hash
provider
provider_id
avatar_url
birth_date
phone, city, state
bio
profile_visibility
is_verified
created_at, updated_at, last_login
```

### ROLES / USER_ROLES

```
ROLES: PK id, name UNIQUE, description
USER_ROLES: PK id, FK user_id, FK role_id, assigned_at, assigned_by
Cardinalidade: USER N:N ROLE
```

### USER_XP / USER_WALLET

```
USER_XP: PK id, FK user_id UNIQUE, level, current_xp, total_xp
USER_WALLET: PK id, FK user_id UNIQUE, coins
Cardinalidade: USER 1:1 USER_XP, USER 1:1 USER_WALLET
```

---

## Cursos

### CATEGORIES → COURSES

```
CATEGORIES: PK id, name, description

COURSES: PK id, FK category_id, title, slug UNIQUE
  short_description, description, thumbnail_url
  course_type (FREE | PAID | PREMIUM)
  progression_type (FREE | PROGRESSIVE)
  status (PENDING_REVIEW | APPROVED | REJECTED | REVISION_REQUIRED)
  certificate_mode, minimum_grade
  created_at, updated_at

Cardinalidade: CATEGORY 1:N COURSES
```

### COURSE_INSTRUCTORS → MODULES → LESSONS / MATERIALS

```
COURSE_INSTRUCTORS: PK id, FK course_id, FK user_id
Cardinalidade: COURSE N:N USERS

MODULES: PK id, FK course_id, title, description, order_number
Cardinalidade: COURSE 1:N MODULES

LESSONS: PK id, FK module_id, title, description
  video_url, video_provider, duration, order_number
Cardinalidade: MODULE 1:N LESSONS

MATERIALS: PK id, FK module_id, title, file_url, file_type
Cardinalidade: MODULE 1:N MATERIALS
```

### COURSE_ENROLLMENTS

```
PK id, FK user_id, FK course_id
progress, enrolled_at, completed_at
Cardinalidade: USER N:N COURSE
```

---

## Quiz

```
QUIZZES: PK id, FK module_id, title, passing_score
QUESTIONS: PK id, FK quiz_id, statement, question_type, points
ALTERNATIVES: PK id, FK question_id, text, is_correct
QUIZ_ATTEMPTS: PK id, FK quiz_id, FK user_id, score, started_at, finished_at
```

---

## Simulados

```
EXAMS: PK id, title, exam_type, description, time_limit
EXAM_QUESTIONS: PK id, FK exam_id, FK question_id, weight
EXAM_ATTEMPTS: PK id, FK exam_id, FK user_id
  score, correct_answers, total_questions, started_at, finished_at
```

> `EXAM_QUESTIONS` referencia `QUESTIONS` do módulo de quiz. Para simulados ENEM grandes, considerar banco de questões separado na Fase 2.

---

## Certificados

```
CERTIFICATES: PK id, FK user_id, FK course_id
certificate_number UNIQUE, verification_code UNIQUE, issue_date
```

---

## Moderação

### INSTRUCTOR_APPLICATIONS

```
PK id, FK user_id, motivation, experience, portfolio_url
status, created_at, reviewed_at
```

### COURSE_MODERATIONS

> Antes chamado incorretamente de `COURSE_REVIEWS`.

```
PK id, FK course_id, FK moderator_id
status, review_notes, reviewed_at
```

---

## HexaSchools

```
SCHOOLS: PK id, name, email, phone, status, created_at

SCHOOL_USERS: PK id, FK school_id, FK user_id, institution_role
  (DIRECTOR | ADMIN | COORDINATOR | TEACHER | STUDENT)
Cardinalidade: SCHOOL N:N USER

SCHOOL_COURSES: PK id, FK school_id, title, description
SCHOOL_CLASSES: PK id, FK school_course_id, name, semester
SCHOOL_ENROLLMENTS: PK id, FK school_class_id, FK user_id, enrolled_at
```

---

## Fase 2 (referência — não implementar no MVP)

### COURSE_RATINGS

Avaliação do **aluno** sobre o curso (não é moderação).

```
PK id, FK user_id, FK course_id
rating, didactics_rating, material_rating, organization_rating
comment, created_at
```

### Outras entidades Fase 2

- `SUBSCRIPTION_PLANS`, `USER_SUBSCRIPTIONS`
- `STORE_ITEMS`, `STORE_PURCHASES`
- `GOALS`, `TASKS`
- `NOTIFICATIONS`
- `LIVE_ROOMS`, `CHAT_MESSAGES`
- `INSTRUCTOR_PROFILES`
- `LESSON_PROGRESS`

---

## Diagrama resumido

```
USERS
 ├── USER_ROLES ── ROLES
 ├── USER_XP
 ├── USER_WALLET
 ├── COURSE_ENROLLMENTS
 ├── QUIZ_ATTEMPTS
 ├── EXAM_ATTEMPTS
 ├── CERTIFICATES
 ├── COURSE_INSTRUCTORS
 ├── INSTRUCTOR_APPLICATIONS
 └── SCHOOL_USERS

CATEGORIES
 └── COURSES
      ├── MODULES → LESSONS, MATERIALS, QUIZZES → QUESTIONS → ALTERNATIVES
      ├── COURSE_INSTRUCTORS
      ├── COURSE_ENROLLMENTS
      ├── COURSE_MODERATIONS
      └── CERTIFICATES

EXAMS → EXAM_QUESTIONS, EXAM_ATTEMPTS

SCHOOLS → SCHOOL_USERS, SCHOOL_COURSES → SCHOOL_CLASSES → SCHOOL_ENROLLMENTS
```
