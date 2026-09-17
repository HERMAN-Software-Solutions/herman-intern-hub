# HERMAN Intern Hub — Documentation

Welcome to the docs. Whether you're a new contributor, a prospective intern, or a HERMAN team member — this is the map.

---

## 📖 Where to Start

| You are... | Read this first |
|---|---|
| **Curious what this is** | [`../README.md`](../README.md) |
| **Setting up locally** | [`getting-started.md`](./getting-started.md) |
| **Contributing code** | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) |
| **Understanding the plan** | [`../SPEC.md`](../SPEC.md) |
| **Working on the database** | [`data-model.md`](./data-model.md) |
| **Working on auth / invitations** | [`auth-flow.md`](./auth-flow.md) |
| **Working on the UI** | [`wireframes.md`](./wireframes.md) |
| **Working on certificates** | [`certificate-spec.md`](./certificate-spec.md) |
| **Doing design work** | [`brand.md`](./brand.md) |

---

## 📚 Full Documentation Index

### Core specs

- **[SPEC.md](../SPEC.md)** — Complete specification of the system
  - Problem statement, goals, users, roles
  - Program rules (payment, duration, certificates)
  - Feature map per user type
  - Success metrics

- **[ROADMAP.md](../ROADMAP.md)** — Phased delivery plan
  - Phase 0 through Phase 4
  - Milestones, risks, timeline
  - Definition of Done per phase

### Engineering docs

- **[data-model.md](./data-model.md)** — Database schema
  - All 15 tables
  - RLS policies (60+)
  - Triggers, functions, sequences
  - Seed data

- **[auth-flow.md](./auth-flow.md)** — Authentication & access control
  - Approval state machine
  - Invitation flow (create → send → accept)
  - Route access matrix
  - Middleware enforcement rules

- **[certificate-spec.md](./certificate-spec.md)** — Certificate generation
  - Layout, colors, fonts
  - Performance score formula
  - Certificate ID format
  - Verification flow
  - Database changes required

### Design docs

- **[wireframes.md](./wireframes.md)** — Screen layouts
  - Public pages
  - Intern portal
  - Admin dashboard
  - PDFs (certificate, report)

- **[brand.md](./brand.md)** — Brand & design tokens
  - Colors
  - Typography
  - Component conventions
  - Accessibility notes

### Guides

- **[getting-started.md](./getting-started.md)** — Local setup (this folder)
- **[../CONTRIBUTING.md](../CONTRIBUTING.md)** — How to contribute
  - Branching strategy
  - Commit conventions
  - PR process
  - Code style

---

## 🗺️ How the Docs Fit Together
┌─────────────────────┐
│ SPEC.md │ ← What we're building
└──────────┬──────────┘
│
┌────────────┼────────────┐
▼ ▼ ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│ data- │ │ auth- │ │ wire- │ ← How we're building it
│ model │ │ flow │ │ frames │
└────┬────┘ └────┬─────┘ └────┬─────┘
│ │ │
└────────────┼─────────────┘
▼
┌──────────────────────┐
│ ROADMAP.md │ ← When we're building it
└──────────────────────┘
│
▼
┌──────────────────────┐
│ CONTRIBUTING │ ← How to help build it
└──────────────────────┘

text

---

## 🎯 Doc Principles

When you write or update docs in this repo:

1. **Keep the audience in mind** — engineers, designers, and readers who've never seen the code
2. **Show, don't just tell** — include schema snippets, code blocks, diagrams
3. **Version them** — update the `Last updated` header when you make changes
4. **Link the source** — reference file paths and functions so people can find the code
5. **Keep it honest** — if something is TBD, mark it `[TBD]`

---

## 📝 Doc Template

When adding a new doc, start here:

```markdown
# Title

Short description of what this doc covers.

**Version:** 1.0
**Status:** Draft / Approved / Stale
**Last updated:** YYYY-MM-DD

---

## Purpose

Why this doc exists. What question does it answer?

## Content

Actual content, sections as needed.

## References

- Related doc: [`other-doc.md`](./other-doc.md)
- Source code: `src/lib/feature/`
💡 Contributing to Docs
Docs are versioned alongside code. To propose a change:

Branch: docs/your-change

Edit the relevant file

Update the Last updated header if it exists

Open a PR with a clear description

Documentation changes are as welcome as code changes.

text

---

## 🚀 Step 2: Add Getting Started Guide

**File:** `docs/getting-started.md`

```markdown
# Getting Started

Complete setup guide for running HERMAN Intern Hub locally.

**Estimated time:** 30–45 minutes (mostly waiting on external services to provision).

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 20+ | [Download](https://nodejs.org) |
| **npm** | 10+ | Comes with Node |
| **Git** | Any recent | [Download](https://git-scm.com) |
| **Supabase account** | Free tier | [Sign up](https://supabase.com) |
| **Brevo account** | Free tier | [Sign up](https://brevo.com) |
| **Vercel account** | Free (Hobby) | [Sign up](https://vercel.com) — only needed for deploy |

You'll need a code editor. We recommend **VS Code**.

---

## Step-by-Step Setup

### 1. Clone the repo

```bash
git clone https://github.com/HERMAN-Software-Solutions/herman-intern-hub.git
cd herman-intern-hub
2. Install dependencies
bash
npm install
This takes 1–2 minutes. You should see ~380 packages installed.

3. Create a Supabase project
Go to supabase.com/dashboard

Click New project

Name it herman-intern-hub

Choose the closest region (Frankfurt or Johannesburg for East Africa)

Set a strong database password — save it in a password manager

Wait ~2 minutes for provisioning

4. Grab your API keys
In your Supabase project:

Go to Project Settings (⚙️) → API

Copy:

Project URL — looks like https://xxxxx.supabase.co (no trailing path)

anon / public key — starts with eyJ...

service_role key — starts with eyJ... (different from anon)

⚠️ Never commit the service_role key. It bypasses all security.

5. Configure environment variables
bash
cp .env.example .env.local
Edit .env.local and fill in:

bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000

BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=infohermansoftware@gmail.com
BREVO_SENDER_NAME=HERMAN Software Solutions

CRON_SECRET=any-random-string-for-local-dev
HERMAN_CEO_NAME=Robert Kisitu
6. Set up the database
Copy the SQL from data-model.md and run it in Supabase → SQL Editor → New query.

You need to run, in order:

Extensions block

All CREATE TABLE statements

All CREATE INDEX statements

All CREATE TRIGGER statements

All ALTER TABLE ... ENABLE ROW LEVEL SECURITY statements

All CREATE POLICY statements

Helper functions (current_role_name, is_admin, next_certificate_id)

Seed data (tech stacks)

7. Create storage buckets
In Supabase → Storage → New bucket, create:

submissions (private)

documents (private)

Then add the storage policies (see data-model.md).

8. Set up Brevo
Log in to app.brevo.com

Go to Senders & IP → Senders → verify infohermansoftware@gmail.com

Go to SMTP & API → API Keys → Generate a new API key

Copy it into BREVO_API_KEY in .env.local

9. Run the dev server
bash
npm run dev
Open http://localhost:3000.

You should see the landing page.

10. Create your admin account
In Supabase → Authentication → Users → Add user

Email: your email

Password: your choice

✅ Check Auto Confirm User

Create the user

Copy the new user's UID

In SQL Editor:

sql
INSERT INTO profiles (id, email, full_name, role, status)
VALUES (
  'PASTE-UID-HERE'::uuid,
  'your-email@example.com',
  'Your Name',
  'super_admin',
  'active'
);
11. Log in
Go to http://localhost:3000/login and sign in with your admin account.

You should land on /dashboard. Navigate to /admin — you'll see the admin dashboard.

Verify everything works
Run through this checklist:

□ Landing page loads at /
□ Apply form submits at /apply
□ Application appears at /admin/applications
□ Approving generates an invitation
□ Invitation email arrives in your inbox
□ Accepting invitation creates an account
□ Onboarding wizard works
□ Mentor assignment activates the intern
□ Intern can see /dashboard
□ Admin sees analytics at /admin
Common issues
Problem	Fix
"Invalid path specified in request URL"	NEXT_PUBLIC_SUPABASE_URL has a /rest/v1/ suffix — remove it
"Email service not configured"	.env.local missing Brevo vars, or dev server not restarted
Build fails with TypeScript errors	Run npx tsc --noEmit to see all errors
RLS blocks your query	Verify your user has a profiles row with the right role
Cron endpoint returns 401	CRON_SECRET mismatch, or you didn't send Authorization: Bearer ...
Next steps
Once your environment is running:

Read auth-flow.md to understand the approval pipeline

Read data-model.md to learn the schema

Check ../CONTRIBUTING.md before opening a PR

Pick a good first issue on GitHub

Getting help
🐛 Found a bug? Open an issue

💬 Have a question? Email infohermansoftware@gmail.com

📖 Check the docs index for more

text

---

## 🔗 Step 3: Add Cross-Links to Existing Docs

Add these footer links to the bottom of your existing docs.

### At the end of `SPEC.md`

```markdown
---

## Related Docs

- [Roadmap](./ROADMAP.md) — When we're building it
- [Data Model](./docs/data-model.md) — How it's stored
- [Auth Flow](./docs/auth-flow.md) — Who can access what
- [Docs Index](./docs/README.md) — All docs
At the end of ROADMAP.md
markdown
---

## Related Docs

- [Spec](./SPEC.md) — What we're building
- [Data Model](./docs/data-model.md) — Schema details
- [Docs Index](./docs/README.md) — All docs
At the end of docs/data-model.md
markdown
---

## Related Docs

- [Spec](../SPEC.md) — Why these tables exist
- [Auth Flow](./auth-flow.md) — How RLS rules apply
- [Docs Index](./README.md) — All docs
At the end of docs/auth-flow.md
markdown
---

## Related Docs

- [Data Model](./data-model.md) — Tables referenced here
- [Wireframes](./wireframes.md) — Screens in this flow
- [Docs Index](./README.md) — All docs