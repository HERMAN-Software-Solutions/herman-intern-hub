# HERMAN Intern Hub — Specification

> Intern lifecycle management for HERMAN Software Solutions Limited.
> Onboarding, projects, tasks, reviews, certificates — all in one place.

**Version:** 1.0 (MVP scope)
**Status:** Draft — approved for Phase 1 build
**Owner:** HERMAN Software Solutions Limited
**Last updated:** [auto — set on commit]

---

## 1. Overview

### 1.1 Problem

HERMAN Software Solutions currently manages interns through:

- WhatsApp messages for coordination
- Manual certificate and experience letter creation
- No central record of who did what, when
- No project, progress, or performance tracking
- No formal onboarding or offboarding process

This is not scalable and creates risk as the program grows toward 30+ interns per cohort.

### 1.2 Solution

**HERMAN Intern Hub** — a web portal that manages the full intern lifecycle:

Application → Onboarding → Projects & Tasks → Reviews → Daily Logs → Certificates → Alumni.

### 1.3 Goals

- Replace WhatsApp coordination with a single source of truth
- Automate certificate and experience letter generation
- Give mentors visibility into every intern's work
- Give interns a professional portal for their work
- Become a public recruitment funnel and case study

### 1.4 Non-Goals (MVP)

- Payroll or financial accounting
- Time-clock / biometric attendance
- Native mobile apps (responsive web only for MVP)
- AI-based performance scoring
- Full HR system for permanent staff (planned later as "HERMAN People")

---

## 2. Users & Roles

| Role | Description | Access |
|---|---|---|
| **Public visitor** | Anyone visiting the site | Landing page, apply form, intern directory, success stories |
| **Applicant** | Someone who submitted an application | Application status page (via email link) |
| **Intern** | Accepted and onboarded | Self-service dashboard: own projects, tasks, logs, documents |
| **Mentor** | Assigned to guide interns | View assigned interns, review submissions, leave feedback |
| **Admin** | HERMAN staff (e.g. HR) | Full access: manage interns, projects, applications, documents |
| **Super Admin** | Owner-level | Everything + role management + system settings |

---

## 3. Program Rules (Business Logic)

### 3.1 Internship Duration
Dynamic — set per intern during registration. Default example: 3 months.

### 3.2 Cohort Size
Up to **30 interns** per cohort.

### 3.3 Compensation
- Interns are **unpaid** by default — they receive **experience and mentorship**.
- **Exception:** If an intern is assigned to a **client project** and signs an HR-approved agreement, payment is made per that agreement.
- The system tracks this via a `compensation_type` field on each project assignment:
  - `unpaid` (default)
  - `paid` (requires linked signed agreement document)

### 3.4 Certificates
Issued on successful completion. Auto-generated as PDF.

### 3.5 Experience Letters
Issued on request or completion. Auto-generated as PDF.

### 3.6 Universities
Captured per applicant during registration. Free text with autocomplete suggestions.

### 3.7 Tech Stack
Interns **choose their learning track** at registration from a standardized list (React, Next.js, Node.js, Python, PostgreSQL, etc.). Admins can add new stacks.

### 3.8 Daily Logs
Required. Interns log work daily. Auto-compiled into weekly reports.

### 3.9 Weekly Reports
Auto-generated every Sunday at 23:59 (Africa/Kampala) from the week's daily logs. Emailed to intern + mentor.

### 3.10 Public Directory
Visible to everyone. Interns opt-in/opt-out via profile setting.

---

## 4. Features

### 4.1 Public (No login)

| Feature | Description |
|---|---|
| Landing page | Explains the program, links to apply and directory |
| Apply form | Name, email, university, course, tech stack interest, portfolio, message |
| Public intern directory | Current + past interns (opt-in), with photo, bio, tech stack, project highlights |
| Success stories | Past interns and where they are now |
| Application status | Applicant checks status via email magic link |

### 4.2 Intern Portal (Login required)

| Feature | Description |
|---|---|
| Onboarding wizard | Complete profile, select tech stack, acknowledge code of conduct |
| Dashboard | Overview: active projects, pending tasks, deadlines, weekly report |
| My Projects | List + detail with tasks, files, updates |
| My Tasks | To-do list across projects, mark complete, attach notes |
| Daily Log | Log hours + description per day |
| Weekly Report | Auto-generated, read-only, exportable PDF |
| My Documents | Offer letter, internship agreement, certificates, experience letters |
| Feedback | Mentor feedback on submitted work |
| Skills Progress | Track learning milestones per tech stack |
| Profile | Edit personal + academic details, directory visibility |

### 4.3 Mentor / Admin Dashboard

| Feature | Description |
|---|---|
| Overview | All interns, active projects, pending reviews |
| Manage Interns | Add, edit, deactivate, change role, extend duration |
| Manage Projects | Create, assign to interns, set compensation type |
| Review Submissions | Approve, request revision, leave feedback |
| Generate Documents | Certificates + experience letters as PDF |
| Applications | Review, accept, reject, convert to intern |
| Reports | Productivity, completion rate, log consistency |
| Notifications | Alerts on submissions, log gaps, milestone completions |
| Audit Log | Every admin action recorded |

### 4.4 System

| Feature | Description |
|---|---|
| Auth | Email/password + email verification (required) |
| Row-Level Security | Interns see only their own data |
| File Storage | Uploads for submissions, documents, avatars |
| Email | Brevo — transactional + weekly digests |
| PDF | jsPDF — certificates, letters, weekly reports |
| Audit | Every sensitive action logged |

---

## 5. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Same as HERMAN website |
| Styling | Tailwind CSS | Same as HERMAN website |
| Database | PostgreSQL via Supabase | Free tier, real SQL, RLS |
| Auth | Supabase Auth | Email/password + verification |
| Storage | Supabase Storage | Files, avatars, documents |
| PDF | jsPDF | Already used on HERMAN site |
| Email | Brevo | Already used by HERMAN |
| Hosting | Vercel | Same as HERMAN site |
| Domain | interns.hermansoftware.com | Subdomain of main site |

---

## 6. Success Metrics (Phase 1)

- ≥ 90% of interns log work at least 4 days/week
- ≥ 80% of tasks reviewed within 48 hours
- Zero manual certificate creation after Phase 2
- ≥ 5 applications/month via public form (after Phase 3)
- Mentor time on coordination reduced by 50%

---

## 7. Roadmap Summary

See `ROADMAP.md` for details.

- **Phase 1 (MVP):** Auth, intern dashboard, admin dashboard, projects, tasks, daily logs
- **Phase 2:** Certificates, experience letters, feedback, weekly report emails
- **Phase 3:** Public landing, apply form, directory, success stories
- **Phase 4:** Analytics, notifications, gamification, "HERMAN People" expansion

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Stipend amount for paid client projects? | HR | TBD |
| 2 | Legal text for internship agreement? | Legal | TBD |
| 3 | Certificate design / branding? | Design | TBD |
| 4 | Default email templates? | Admin | TBD |

---

## 9. References

- Live website: https://herman-software-website.vercel.app
- Data model: `docs/data-model.md`
- Wireframes: `docs/wireframes.md`
- Brand: `docs/brand.md`
- Contributing: `CONTRIBUTING.md`

---

© HERMAN Software Solutions Limited — Jinja, Gabula Rd, Uganda
Contact: infohermansoftware@gmail.com · +256 772 723 188