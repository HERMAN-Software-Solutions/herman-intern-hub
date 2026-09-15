# Data Model

PostgreSQL schema for HERMAN Intern Hub (Supabase).

---

## Tables

### `auth.users` (Supabase-managed)
Handles authentication. Extended by `profiles`.

---

### `profiles`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, FK → auth.users.id |
| role | enum | `applicant`, `intern`, `mentor`, `admin`, `super_admin` |
| full_name | text | |
| email | text | |
| phone | text | |
| avatar_url | text | |
| university | text | Dynamic — captured at registration |
| course | text | |
| year_of_study | text | |
| start_date | date | Dynamic per intern |
| end_date | date | Dynamic per intern |
| mentor_id | uuid | FK → profiles.id |
| status | enum | `pending`, `active`, `paused`, `completed`, `withdrawn` |
| directory_visible | boolean | Default true — opt-out |
| bio | text | For public directory |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `tech_stacks`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | e.g. React, Python |
| category | text | e.g. Frontend, Backend, Database |
| is_active | boolean | |

---

### `intern_tech_stacks` (join)

| Column | Type | Notes |
|---|---|---|
| intern_id | uuid | FK → profiles.id |
| tech_stack_id | uuid | FK → tech_stacks.id |
| proficiency | enum | `beginner`, `intermediate`, `advanced` |
| selected_at | timestamptz | |

---

### `projects`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| title | text | |
| description | text | |
| status | enum | `planning`, `active`, `review`, `completed` |
| start_date | date | |
| due_date | date | |
| is_client_project | boolean | If true → compensation possible |
| created_by | uuid | FK → profiles.id |
| created_at | timestamptz | |

---

### `project_assignments`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK |
| intern_id | uuid | FK → profiles.id |
| role | enum | `lead`, `contributor` |
| compensation_type | enum | `unpaid`, `paid` |
| agreement_document_id | uuid | FK → documents.id (nullable, required if paid) |
| assigned_at | timestamptz | |

---

### `tasks`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| project_id | uuid | FK |
| assigned_to | uuid | FK → profiles.id |
| title | text | |
| description | text | |
| status | enum | `todo`, `in_progress`, `review`, `done` |
| due_date | date | |
| created_by | uuid | FK → profiles.id |
| created_at | timestamptz | |

---

### `submissions`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| task_id | uuid | FK |
| intern_id | uuid | FK → profiles.id |
| content | text | |
| file_url | text | Supabase storage path |
| submitted_at | timestamptz | |
| status | enum | `pending`, `approved`, `needs_revision` |

---

### `feedback`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| submission_id | uuid | FK |
| mentor_id | uuid | FK → profiles.id |
| content | text | |
| created_at | timestamptz | |

---

### `daily_logs`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| intern_id | uuid | FK → profiles.id |
| date | date | One per day |
| hours_worked | numeric | |
| description | text | |
| created_at | timestamptz | |

Unique constraint: `(intern_id, date)`.

---

### `weekly_reports`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| intern_id | uuid | FK → profiles.id |
| week_start | date | Monday |
| week_end | date | Sunday |
| summary | text | Auto-generated |
| total_hours | numeric | |
| pdf_url | text | |
| generated_at | timestamptz | |

---

### `documents`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| intern_id | uuid | FK → profiles.id |
| type | enum | `offer_letter`, `agreement`, `certificate`, `experience_letter` |
| file_url | text | |
| issued_date | date | |
| issued_by | uuid | FK → profiles.id |

---

### `applications`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| email | text | |
| phone | text | |
| university | text | |
| course | text | |
| year_of_study | text | |
| tech_stack_interest | text[] | Array of stack IDs or names |
| portfolio_url | text | |
| message | text | |
| status | enum | `pending`, `reviewing`, `accepted`, `rejected`, `withdrawn` |
| reviewed_by | uuid | FK → profiles.id |
| reviewed_at | timestamptz | |
| submitted_at | timestamptz | |

---

### `audit_log`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| actor_id | uuid | FK → profiles.id |
| action | text | e.g. `certificate.issued` |
| entity | text | e.g. `documents` |
| entity_id | uuid | |
| metadata | jsonb | |
| created_at | timestamptz | |

---

## Row-Level Security (RLS)

| Table | Policy |
|---|---|
| profiles | Interns read/update own row; mentors read assigned interns; admins read all |
| projects | Interns read assigned projects; admins full access |
| tasks | Interns read/update assigned tasks; admins full access |
| daily_logs | Interns CRUD own; mentors read assigned; admins read all |
| documents | Interns read own; admins full access |
| applications | Public insert; admins read/update |

---

## Enums Summary

- `role`: applicant, intern, mentor, admin, super_admin
- `intern_status`: pending, active, paused, completed, withdrawn
- `project_status`: planning, active, review, completed
- `task_status`: todo, in_progress, review, done
- `submission_status`: pending, approved, needs_revision
- `document_type`: offer_letter, agreement, certificate, experience_letter
- `application_status`: pending, reviewing, accepted, rejected, withdrawn
- `compensation_type`: unpaid, paid