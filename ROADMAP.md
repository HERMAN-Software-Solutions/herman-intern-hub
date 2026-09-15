# Roadmap

Phased delivery plan for HERMAN Intern Hub.

**Version:** 1.1 (approval flow + onboarding)
**Last updated:** 2026-09-16

---

## Guiding Principles

1. **Ship small, ship often.** Each phase produces a usable, demoable increment.
2. **No public self-registration, ever.** Every account flows through approval + invitation.
3. **Security from day one.** RLS + status gates are not retrofitted later.
4. **Built for interns, by HERMAN.** Future interns will work on this codebase.
5. **Every phase ends with a live, working URL.**

---

## Status Legend

- ⏳ Not started
- 🚧 In progress
- ✅ Complete
- ⏸️ Blocked / paused

---

## Phase 0 — Foundations ✅

**Completed:** 2026-09-16

- [x] Specification (`SPEC.md`)
- [x] Data model design (`docs/data-model.md`)
- [x] Auth flow design (`docs/auth-flow.md`)
- [x] Wireframes (`docs/wireframes.md`)
- [x] Brand guide (`docs/brand.md`)
- [x] Roadmap (`ROADMAP.md`)
- [x] GitHub repo + docs pushed
- [x] Next.js 14 + Tailwind + TypeScript initialized
- [x] Supabase project created
- [x] Supabase client wired in
- [x] Deployed to Vercel → https://herman-intern-hub.vercel.app

**Ship criteria met:** Live URL with Supabase connection verified.

---

## Phase 1 — Approval Flow, Onboarding & Intern Dashboard 🚧

**Target:** Weeks 1–3
**Goal:** Replace WhatsApp coordination. Enforce approval → invitation → onboarding → dashboard.

### 1A — Database & Security

- [ ] Run full SQL schema in Supabase (all tables from `data-model.md`)
- [ ] Seed `tech_stacks` table
- [ ] Enable Row-Level Security on all tables
- [ ] Write RLS policies (intern / mentor / admin scopes)
- [ ] Create helper functions (`current_role_name()`, `maybe_activate_intern()`)
- [ ] Set up storage buckets (`avatars`, `submissions`, `documents`)
- [ ] Set up `pg_cron` for hourly invitation expiry
- [ ] Create `audit_log` write-only policy (service role only)

**Exit criteria:** All tables exist, RLS enforced, seed data present, no user can read another user's row.

### 1B — Invitation & Approval System

- [ ] Server action: `createInvitation()`
- [ ] Server action: `acceptInvitation(token, password, agreement)`
- [ ] Server action: `revokeInvitation(id)`
- [ ] Server action: `resendInvitation(id)`
- [ ] Brevo email templates (invite, welcome, mentor-assigned)
- [ ] `/invite/[token]` page — set password + sign agreement
- [ ] Error states: expired, revoked, invalid, already-used
- [ ] Rate limiting on `/apply` (Upstash or Vercel KV)

**Exit criteria:** Admin can invite someone; that person receives an email; clicking the link creates their account.

### 1C — Public Application

- [ ] `/apply` multi-step form (5 steps)
- [ ] Validation (client + server)
- [ ] `/apply/success` confirmation page
- [ ] `/apply/status` — email magic link to view status
- [ ] Brevo: application-received email
- [ ] Store in `applications` table with `status = 'pending'`

**Exit criteria:** A stranger can apply; the application shows in admin inbox.

### 1D — Auth (Login Only — No Signup)

- [ ] `/login` page (email + password)
- [ ] Logout
- [ ] Password reset flow (`/forgot-password`, `/reset-password`)
- [ ] Email verification enforced by Supabase
- [ ] Middleware status gate (from `docs/auth-flow.md`)
- [ ] Redirect logic per status

**Exit criteria:** An invited user can log in; unauthorized users cannot reach protected routes.

### 1E — Onboarding Wizard

- [ ] `/onboarding/welcome` — intro
- [ ] `/onboarding/profile` — name, phone, university, course, bio, avatar
- [ ] `/onboarding/tech-stack` — multi-select from `tech_stacks`
- [ ] `/onboarding/agreement` — scrollable terms + checkbox
- [ ] `/onboarding/pending` — waiting for mentor
- [ ] Trigger fires on mentor assignment → `status = 'active'`
- [ ] Emails: onboarding-complete (to admin), activation (to intern + mentor)

**Exit criteria:** A new invitee can complete onboarding; they see "pending" until mentor is assigned.

### 1F — Admin Dashboard (Core)

- [ ] Admin layout with sidebar
- [ ] `/admin` overview with KPIs
- [ ] `/admin/applications` — list + filters
- [ ] `/admin/applications/[id]` — detail + approve modal
- [ ] Approve modal → creates invitation + sends email
- [ ] `/admin/invitations` — list, resend, revoke, copy link
- [ ] `/admin/interns` — list with filters
- [ ] `/admin/interns/[id]` — profile, mentor assignment, actions
- [ ] `/admin/interns/invite` — direct invite
- [ ] Reject flow (application → `rejected`, optional rejection email)

**Exit criteria:** Admin can run the full lifecycle from one dashboard.

### 1G — Intern Dashboard (Core)

- [ ] Intern layout with sidebar
- [ ] `/dashboard` overview
- [ ] `/dashboard/projects` — list
- [ ] `/dashboard/projects/[id]` — detail
- [ ] `/dashboard/tasks` — list with filters
- [ ] `/dashboard/logs` — daily log entry + week view
- [ ] `/dashboard/profile` — edit
- [ ] `/account-status` — for paused/completed/withdrawn

**Exit criteria:** An active intern can see their work, log daily, and manage their profile.

### Phase 1 Definition of Done

- Zero public signup path exists
- Every account is traceable to an invitation row
- Every active intern has an assigned mentor
- Every user's access matches their `profiles.status`
- Live at `herman-intern-hub.vercel.app`
- 5 real interns onboarded successfully

---

## Phase 2 — Documents & Reviews

**Target:** Week 4
**Goal:** Automate the paperwork and formalize the review loop.

- [ ] Task submission form (text + file upload)
- [ ] Mentor review queue (`/admin/submissions`)
- [ ] Approve / request revision with feedback
- [ ] Feedback thread (mentor ↔ intern)
- [ ] Certificate PDF generation (jsPDF) on `/admin/interns/[id]`
- [ ] Experience letter PDF generation
- [ ] Weekly report auto-generation (cron, Sunday 23:59 EAT)
- [ ] Weekly report PDF export
- [ ] Weekly report email (intern + mentor)
- [ ] Document storage + signed download URLs
- [ ] `/dashboard/documents` — list + download
- [ ] `/dashboard/reports` — list + view PDF

**Ship criteria:** Zero manual certificate creation. Mentors never touch WhatsApp for reviews.

---

## Phase 3 — Public Presence

**Target:** Week 5
**Goal:** Turn the Hub into a recruitment funnel.

- [ ] `/` landing page (public)
- [ ] `/interns` — public intern directory (opt-in)
- [ ] `/interns/[id]` — public intern profile
- [ ] `/success-stories` — alumni showcase
- [ ] FAQ section
- [ ] SEO: metadata, sitemap, robots.txt, OG images
- [ ] Google Search Console verification
- [ ] Analytics (Vercel Analytics or Plausible)

**Ship criteria:** First 5 organic applications received via the public form.

---

## Phase 4 — Expansion (Ongoing)

- [ ] Analytics dashboard for admins
- [ ] Push + email notifications (real-time)
- [ ] Skills milestones + badges
- [ ] Video submissions for tasks
- [ ] Mobile PWA (installable)
- [ ] Two-factor auth for admin/mentor
- [ ] IP allowlist for `/admin/*`
- [ ] "HERMAN People" — extend to permanent staff
- [ ] Public API for third-party integrations
- [ ] Open-source the codebase (optional — after case study published)

---

## Cross-Cutting Work (Continuous)

These items are addressed in every phase, not just once:

- **Testing:** Add tests for every new server action
- **Documentation:** Update `docs/` with each feature
- **Accessibility:** WCAG AA compliance on all new screens
- **Performance:** Lighthouse ≥ 90 on all public pages
- **Audit logging:** Every admin action writes to `audit_log`
- **Email templates:** Maintain in one place, version-controlled

---

## Milestones (Business)

| Milestone | Trigger | Outcome |
|---|---|---|
| **M1 — Internal demo** | Phase 1 complete | Show Hub to team; onboard first 3 interns |
| **M2 — First cohort** | Phase 2 complete | 10+ interns managed end-to-end |
| **M3 — Public launch** | Phase 3 complete | Public site live; applications open |
| **M4 — Case study** | Post Phase 3 | Publish "How we built our own intern hub" |
| **M5 — Open source** | Post Phase 4 | Public repo + contribution guide |

---

## Known Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Supabase free tier limits hit | Medium | Monitor usage; upgrade to Pro at scale ($25/mo) |
| Vercel private org repo limitation | Solved | Repo transferred to personal account; move to org + Pro at launch |
| Brevo email deliverability | Medium | Use verified sender domain (`@hermansoftware.com`) |
| Scope creep in Phase 1 | High | Strictly enforce "Definition of Done" per sub-phase |
| Intern churn mid-onboarding | Low | Onboarding wizard saves partial progress |
| Admin forgets to assign mentor | Medium | Daily reminder email + dashboard alert |

---

## Timeline (Estimated)

| Phase | Duration | Target Completion |
|---|---|---|
| 0 — Foundations | 1 day | ✅ 2026-09-16 |
| 1 — Approval + Dashboard | 2–3 weeks | 2026-10-07 |
| 2 — Documents | 1 week | 2026-10-14 |
| 3 — Public | 1 week | 2026-10-21 |
| 4 — Expansion | Ongoing | — |

*(Timeline assumes part-time effort — adjust based on availability.)*

---

## How This Roadmap Is Used

1. **Weekly review** — check off items as they ship
2. **Commit messages reference phase** — e.g. `feat(phase-1b): add invitation server action`
3. **PRs link to items** — GitHub issues mirror these checkboxes
4. **Roadmap updates are versioned** — every change to this file is a commit

---

## References

- `SPEC.md` — full specification
- `docs/auth-flow.md` — approval + invitation flow
- `docs/data-model.md` — database schema
- `docs/wireframes.md` — screen layouts
- `docs/brand.md` — design tokens
- `CONTRIBUTING.md` — how to contribute

---

© HERMAN Software Solutions Limited — Jinja, Gabula Rd, Uganda
Contact: infohermansoftware@gmail.com · +256 772 723 188