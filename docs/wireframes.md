# Wireframes (Text)

Low-fidelity screen layouts. Mobile-first, responsive.

---

## Public — Landing (`/`)

Header: HERMAN logo · Nav (Apply, Directory, Success Stories) · Sign in

Hero:
- H1: "Launch your software career with HERMAN"
- Sub: "Real projects. Real mentorship. Real experience."
- CTA: [Apply now] [Browse interns]

Sections:
- What you'll learn (tech stack chips)
- How it works (Apply → Onboard → Build → Certify)
- Current cohort (grid of intern cards — if directory_visible)
- Success stories (2–3 cards)
- FAQ
- Footer (contact, links, license)

---

## Public — Apply (`/apply`)

Multi-step form:
1. Personal: name, email, phone
2. Academic: university, course, year
3. Tech interest: multi-select (React, Python, …)
4. Portfolio + message
5. Review + submit

On submit → email verification → status page.

---

## Public — Directory (`/interns`)

Grid of cards:
- Avatar
- Name
- University + course
- Tech stack chips
- Current project (optional)
- Link to profile

Filters: tech stack, university, status (current/alumni).

---

## Intern — Onboarding Wizard (`/onboarding`)

Step 1: Complete profile (photo, bio, phone)
Step 2: Select tech stack (multi-select)
Step 3: Set availability + internship duration
Step 4: Acknowledge code of conduct + sign agreement (checkbox)
Step 5: Done → dashboard

---

## Intern — Dashboard (`/dashboard`)

Top bar: HERMAN Intern Hub · notifications · profile menu

Left sidebar:
- Dashboard
- Projects
- Tasks
- Daily Log
- Weekly Reports
- Documents
- Profile

Main:
- Greeting + week summary
- Active projects (progress bars)
- Tasks due this week
- Today's log (quick entry)
- Recent feedback

---

## Intern — Daily Log (`/dashboard/logs`)

- Date (default today)
- Hours worked (number)
- Description (textarea)
- [Save]

Below: recent entries table (date, hours, description, edit).

---

## Intern — Documents (`/dashboard/documents`)

Table:
- Type | Issued date | Actions (view, download)

Empty state: "Your offer letter will appear here after onboarding."

---

## Admin — Dashboard (`/admin`)

Top bar: HERMAN Admin · search · notifications

Left sidebar:
- Overview
- Interns
- Projects
- Applications
- Submissions
- Documents
- Reports
- Settings

Main:
- KPI cards: Active interns | Pending reviews | Applications this month | Certificates issued
- Recent activity feed
- Pending approvals table
- Log gaps (interns who haven't logged in 2+ days)

---

## Admin — Intern Detail (`/admin/interns/[id]`)

Tabs:
- Profile (edit all fields, change mentor, extend duration)
- Projects (list + assign)
- Tasks (all tasks)
- Logs (daily logs)
- Documents (generate certificate / experience letter)
- Audit (all actions on this intern)

Actions:
- [Generate Certificate]
- [Generate Experience Letter]
- [Deactivate]
- [Mark Completed]

---

## Admin — Projects (`/admin/projects/[id]`)

- Project meta (title, description, dates, client-project toggle)
- Assigned interns (with compensation_type)
- Tasks (kanban: todo / in_progress / review / done)
- Submissions (pending approval list)
- Files

---

## Certificate PDF Layout
┌────────────────────────────────────┐
│ HERMAN SOFTWARE SOLUTIONS LIMITED │
│ ───────────────────────────── │
│ │
│ CERTIFICATE OF INTERNSHIP │
│ │
│ This certifies that │
│ │
│ [INTERN FULL NAME] │
│ │
│ successfully completed an │
│ internship in [TECH STACK] from │
│ [START DATE] to [END DATE]. │
│ │
│ Signed: [mentor] [admin] │
│ │
│ Jinja, Gabula Rd, Uganda │
│ infohermansoftware@gmail.com │
└────────────────────────────────────┘

text

---

## Design Tokens

See `docs/brand.md`.