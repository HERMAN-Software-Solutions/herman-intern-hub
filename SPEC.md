# HERMAN Intern Hub — Specification

> Intern lifecycle management for HERMAN Software Solutions Limited.
> Invitation-only onboarding, projects, tasks, reviews, certificates — all in one place.

**Version:** 1.1 (MVP scope + approval flow)
**Status:** Draft — approved for Phase 1 build
**Owner:** HERMAN Software Solutions Limited
**Last updated:** 2026-09-16

---

## 1. Overview

### 1.1 Problem

HERMAN Software Solutions currently manages interns through:

- WhatsApp messages for coordination
- Manual certificate and experience letter creation
- No central record of who did what, when
- No project, progress, or performance tracking
- No formal onboarding or offboarding process
- No gate between "someone heard about us" and "someone has portal access"

This is not scalable and creates risk as the program grows toward 30+ interns per cohort.

### 1.2 Solution

**HERMAN Intern Hub** — a web portal that manages the full intern lifecycle:

Application → Review → Approval → Invitation → Onboarding → Projects & Tasks → Reviews → Daily Logs → Certificates → Alumni.

### 1.3 Goals

- Replace WhatsApp coordination with a single source of truth
- Enforce an explicit approval + invitation flow (no public self-registration)
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
| **Invited user** | Applicant who received an invitation but hasn't accepted | Accept-invite page only |
| **Onboarding intern** | Accepted invite, wizard in progress | Onboarding wizard only |
| **Intern (active)** | Fully onboarded + mentor assigned | Full self-service dashboard |
| **Alumni** | Completed internship | Read-only access to own documents |
| **Mentor** | Assigned to guide interns | View assigned interns, review submissions, leave feedback |
| **Admin** | HERMAN staff (HR, program lead) | Manage interns, projects, applications, documents |
| **Super Admin** | Owner-level | Everything + role management + system settings |

---

## 3. Program Rules (Business Logic)

### 3.1 Internship Duration
Dynamic — set per intern during approval. Default example: 3 months.

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
Interns **choose their learning track** during onboarding from a standardized list (React, Next.js, Node.js, Python, PostgreSQL, etc.). Admins can add new stacks.

### 3.8 Daily Logs
Required. Interns log work daily. Auto-compiled into weekly reports.

### 3.9 Weekly Reports
Auto-generated every Sunday at 23:59 (Africa/Kampala) from the week's daily logs. Emailed to intern + mentor.

### 3.10 Public Directory
Visible to everyone. Only active and completed interns appear. Interns opt-in/opt-out via profile setting.

### 3.11 No Public Self-Registration
**There is no `/signup` route.** Account creation happens only via an accepted invitation. The only public entry point is `/apply`.

### 3.12 Approval Required Before Access
Every intern is approved by an Admin or Super Admin. No exceptions. Approval triggers an invitation email; nothing happens before that.

### 3.13 Mentor Assignment Required
Before an intern's status flips to `active`, an admin must assign a mentor. Until then, the intern sits in the `onboarding` state and sees only the onboarding wizard.

### 3.14 Agreement Signing Required
Every intern must sign a code of conduct + internship terms during onboarding. Timestamp and version stored on the profile.

### 3.15 Invitation Expiry
Invitations expire 7 days after creation. Expired invitations can be re-issued by an admin.

### 3.16 Data Retention
Intern profiles and their documents are retained indefinitely for alumni tracking. Personal data can be deleted on request.

---

## 4. Features

### 4.1 Public (No login)

| Feature | Description |
|---|---|
| Landing page | Explains the program, links to apply and directory |
| Apply form | Name, email, university, course, tech stack interest, portfolio, message |
| Application status | Applicant checks status via email magic link |
| Public intern directory | Active + completed interns (opt-in), with photo, bio, tech stack |
| Success stories | Past interns and where they are now |
| Accept invitation | `/invite/[token]` — set password, verify email, sign agreement |
| Login | Email/password for existing users |

> ⚠️ **No public signup page exists.** Only invitations grant access.

### 4.2 Intern Portal (Login required — status-gated)

| Feature | Description |
|---|---|
| Onboarding welcome | First login landing page |
| Profile wizard | Name, photo, phone, university, course, bio |
| Tech stack wizard | Multi-select from standardized list |
| Agreement wizard | Code of conduct + internship terms, timestamped |
| Pending page | Waiting-for-mentor state |
| Dashboard | Overview: active projects, pending tasks, deadlines, weekly report |
| My Projects | List + detail with tasks, files, updates |
| My Tasks | To-do list across projects, mark complete, attach notes |
| Daily Log | Log hours + description per day |
| Weekly Report | Auto-generated, read-only, exportable PDF |
| My Documents | Offer letter, internship agreement, certificates, experience letters |
| Feedback | Mentor feedback on submitted work |
| Skills Progress | Track learning milestones per tech stack |
| Profile | Edit personal + academic details, directory visibility |
| Account status | Read-only page for paused/completed/withdrawn |

### 4.3 Mentor / Admin Dashboard

| Feature | Description |
|---|---|
| Overview | All interns, active projects, pending reviews, log gaps |
| Applications inbox | Review, approve, reject applications |
| Approve modal | Set start date, duration, mentor, tech stack, welcome message |
| Send invitation | Creates invitation token, emails magic link |
| Manage Invitations | View pending, resend, revoke |
| Direct invite | Invite a known candidate without public application |
| Manage Interns | Add, edit, deactivate, change role, extend duration |
| Assign Mentor | Required before intern becomes active |
| Manage Projects | Create, assign to interns, set compensation type |
| Review Submissions | Approve, request revision, leave feedback |
| Generate Documents | Certificates + experience letters as PDF |
| Reports | Productivity, completion rate, log consistency |
| Notifications | Alerts on submissions, log gaps, milestone completions |
| Audit Log | Every admin action recorded |

### Mentor Invite Flow

Admins invite mentors via `/admin/mentors/invite`. Mentors receive the same
invitation email as interns, but with role-specific copy. On accepting:

1. Auth user created
2. Profile created with `role = 'mentor'`, `status = 'active'`
3. Bio + expertise stored
4. Redirected to `/mentor`

Mentors skip the onboarding wizard and are immediately available for assignment.

### 4.4 System

| Feature | Description |
|---|---|
| Auth | Email/password + email verification (required), no public signup |
| Invitations | Token-based, single-use, 7-day expiry, emailed via Brevo |
| Status enforcement | Middleware + DB-level checks on every protected route |
| Row-Level Security | Interns see only their own data; unapproved users see nothing |
| File Storage | Uploads for submissions, documents, avatars |
| Email | Brevo — transactional + weekly digests + invitations |
| PDF | jsPDF — certificates, letters, weekly reports |
| Audit | Every sensitive action logged |

---

## 5. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Same as HERMAN website |
| Styling | Tailwind CSS | Same as HERMAN website |
| Database | PostgreSQL via Supabase | Free tier, real SQL, RLS |
| Auth | Supabase Auth | Email/password + verification + admin invite API |
| Storage | Supabase Storage | Files, avatars, documents |
| PDF | jsPDF | Already used on HERMAN site |
| Email | Brevo | Already used by HERMAN |
| Hosting | Vercel | Same as HERMAN site |
| Domain | interns.hermansoftware.com | Subdomain of main site |

---

## 6. Success Metrics (Phase 1)

- **Zero unauthorized signups per month** (no public registration path exists)
- ≥ 90% of active interns log work at least 4 days/week
- ≥ 80% of tasks reviewed within 48 hours
- Zero manual certificate creation after Phase 2
- ≥ 5 applications/month via public form (after Phase 3)
- Mentor time on coordination reduced by 50%
- 100% of active interns have an assigned mentor

---

## 7. Roadmap Summary

See `ROADMAP.md` for details.

- **Phase 1 (MVP):** Invitation system, application review + approval, onboarding wizard, auth, intern dashboard, admin dashboard
- **Phase 2:** Certificates, experience letters, feedback, weekly report emails
- **Phase 3:** Public landing, apply form (public), directory, success stories
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
- Auth flow: `docs/auth-flow.md`
- Data model: `docs/data-model.md`
- Wireframes: `docs/wireframes.md`
- Brand: `docs/brand.md`
- Contributing: `CONTRIBUTING.md`

---

© HERMAN Software Solutions Limited — Jinja, Gabula Rd, Uganda
Contact: infohermansoftware@gmail.com · +256 772 723 188